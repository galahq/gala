# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeploymentPolicy do
  let(:reader_context) { DeploymentPolicy::UserContext.new create :reader }
  let(:editor) { DeploymentPolicy::UserContext.new create :reader, :editor }

  let(:deployment) { create :deployment }

  subject { described_class }

  permissions :show? do
    it 'does not allow an arbitrary reader to view a deployment' do
      expect(subject).not_to permit reader_context, deployment
    end

    it 'allows an instructor to view her own deployment' do
      create :group_membership, group: deployment.group,
                                reader: reader_context.reader,
                                status: :admin
      expect(subject).to permit reader_context, deployment
    end

    it 'allows an editor to view any deployment' do
      expect(subject).to permit editor, deployment
    end
  end

  permissions :update? do
    it 'does not allow an arbitrary reader to edit a deployment' do
      expect(subject).not_to permit reader_context, deployment
    end

    it 'does not allow a student enrolled in the case to edit its deployment' do
      create :group_membership, group: deployment.group,
                                reader: reader_context.reader
      expect(subject).not_to permit reader_context, deployment
    end

    it 'allows an instructor to edit her own deployment' do
      create :group_membership, group: deployment.group,
                                reader: reader_context.reader,
                                status: :admin
      expect(subject).to permit reader_context, deployment
    end

    it 'allows an unknown user with a valid LTI context to edit deployments ' \
       'that belong to that context' do
      deployment.group.context_id = 'context'
      reader_context.selection_params = { 'context_id' => 'context' }

      expect(subject).to permit reader_context, deployment
    end

    it 'allows an editor to edit any deployment' do
      expect(subject).to permit editor, deployment
    end
  end

  # Register A23: when a class's only instructor closes their account, site
  # admins can still reach its roster and results from their deployments list.
  describe DeploymentPolicy::AdminScope do
    let!(:deployment) { create :deployment }

    it 'lists every deployment for a site admin' do
      scope = described_class.new(create(:reader, :editor), Deployment).resolve

      expect(scope).to include deployment
    end

    it 'lists only an instructor\'s own deployments' do
      instructor = create :reader
      own = create :deployment
      create :group_membership, group: own.group, reader: instructor,
                                status: :admin

      scope = described_class.new(instructor, Deployment).resolve

      expect(scope).to contain_exactly own
    end
  end
end
