# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminsController, type: :controller do
  let(:editor) { create(:reader, :editor) }
  let(:reader) { create(:reader) }
  let(:kase) { create(:case, :published) }

  describe 'POST #copy' do
    it 'redirects an editor to the cloned admin case' do
      sign_in editor
      cloned_case = build_stubbed(:case, id: 12_345, slug: 'cloned-admin-case')
      cloned_result = instance_double('Clowne::Utils::Clone', to_record: cloned_case)

      allow(CaseCloner).to receive(:call)
        .with(kase, locale: I18n.locale)
        .and_return(cloned_result)

      post :copy_case, params: { resource: 'cases', id: kase.to_param }

      expect(response).to redirect_to(admin_case_path(cloned_case))
    end

    it 'redirects a non-editor away from the copy route' do
      sign_in reader

      expect(CaseCloner).not_to receive(:call)

      post :copy_case, params: { resource: 'cases', id: kase.to_param }

      expect(response).to redirect_to('/403')
    end
  end
end
