# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeploymentPolicy do
  let(:reader_context) { DeploymentPolicy::UserContext.new build :reader }
  let(:editor) { DeploymentPolicy::UserContext.new build :reader, :editor }

  let(:deployment) { build :deployment }

  subject { described_class }

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
end
