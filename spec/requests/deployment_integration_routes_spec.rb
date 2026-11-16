# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Deployment and integration routes' do
  include Orchard::Integration::TestHelpers::LtiLaunch

  let(:reader) { create(:reader) }
  let(:group) { create(:group) }
  let(:kase) { create(:case, :published) }

  before do
    host! 'test.host'
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
  end

  def sign_in_group_admin
    create(:group_membership, reader: reader, group: group, status: :admin)
    sign_in reader
  end

  describe 'deployment routes' do
    it 'renders the deployment index for a group administrator' do
      sign_in_group_admin
      create(:deployment, group: group, case: kase)

      get deployments_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include('bp6-button')
    end

    context 'with a class named only in another language' do
      # As created by an instructor using Gala in Spanish, and stored that way.
      let(:spanish) do
        create(:group).tap { |spanish| spanish.update_columns(name: { 'es' => 'Clase de prueba' }) }
      end

      # Site admins see every class (register A23).
      it 'renders the deployment index for a site admin' do
        create(:deployment, group: group, case: kase)
        create(:deployment, group: spanish, case: kase)
        sign_in create(:reader, :editor)

        get deployments_path

        expect(response).to have_http_status(:success)
        expect(response.body).to include('Clase de prueba', ERB::Util.html_escape(group.name))
      end

      it 'lists it on the new deployment form for its instructor' do
        create(:group_membership, reader: reader, group: spanish, status: :admin)
        create(:deployment, group: spanish, case: create(:case, :published))
        sign_in_group_admin
        create(:deployment, group: group, case: kase)

        get new_deployment_path(case_slug: kase.slug)

        expect(response).to have_http_status(:success)
        expect(response.body).to include('Clase de prueba', ERB::Util.html_escape(group.name))
      end

      it 'names it on its deployment page' do
        create(:group_membership, reader: reader, group: spanish, status: :admin)
        deployment = create(:deployment, group: spanish, case: kase)
        sign_in reader

        get deployment_path(deployment)

        expect(response).to have_http_status(:success)
        expect(response.body).to include('Clase de prueba')
      end
    end

    it 'renders a deployment show page for a group administrator' do
      sign_in_group_admin
      deployment = create(:deployment, :with_quiz, group: group, case: kase)

      get deployment_path(deployment)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('bp6-breadcrumb')
    end

    it 'renders the new deployment form for a selected case' do
      sign_in reader

      get new_deployment_path(case_slug: kase.slug)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('bp6-card')
    end

    it 'creates a deployment and redirects back to the deployment list' do
      sign_in reader

      post deployments_path,
           params: {
             deployment: {
               case_id: kase.id,
               group_attributes: { name: 'Phase 7 Study Group' }
             }
           }

      deployment = Deployment.find_by!(case: kase)
      expect(response).to redirect_to(deployments_path(anchor: "d#{deployment.id}"))
      expect(deployment.group.group_memberships.admin.where(reader: reader))
        .to exist
    end

    it 'renders the deployment edit pack shell for an authorized instructor' do
      sign_in_group_admin
      deployment = create(:deployment, group: group, case: kase)

      get edit_deployment_path(deployment)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('deployment-app')
      expect(response.body).to include('deployment')
    end

    it 'updates deployment customization through JSON' do
      sign_in_group_admin
      deployment = create(:deployment, group: group, case: kase)

      patch deployment_path(deployment),
            params: { deployment: { answers_needed: 0 } },
            as: :json

      expect(response).to have_http_status(:success)
      expect(response.body).to be_json including(
        redirect: deployments_path(anchor: "d#{deployment.id}quiz")
      )
    end

    it 'exports deployment submissions for an authorized instructor' do
      sign_in_group_admin
      deployment = create(:deployment, :with_quiz, group: group, case: kase)

      get deployment_submissions_path(deployment, format: :csv)

      expect(response).to have_http_status(:success)
      expect(response.media_type).to eq('text/csv')
    end
  end

  describe 'integration routes' do
    it 'renders the LTI XML configuration' do
      get '/authentication_strategies/config/lti.xml'

      expect(response).to have_http_status(:success)
      expect(response.media_type).to eq('application/xml')
      expect(response.body).to include('<blti:title>Gala</blti:title>')
    end

    it 'rejects invalid content-item launches without setting selection state' do
      post catalog_content_items_path

      expect(response).to redirect_to(root_path)
      expect(session[:content_item_selection_params]).to be_nil
    end

    it 'stores selection state when LTI validation succeeds' do
      allow_any_instance_of(ApplicationController)
        .to receive(:lti_request_valid?).and_return(true)

      override_environment_variables do
        post catalog_content_items_path, params: valid_lti_params
      end

      expect(response).to redirect_to(root_path)
      expect(session[:content_item_selection_params]).to be_present
    end

    it 'requires content-item selection state before Canvas deployment creation' do
      post group_canvas_deployments_path(group), params: { case_slug: kase.slug }

      expect(response).to redirect_to(root_url)
    end
  end
end
