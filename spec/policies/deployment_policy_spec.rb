# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeploymentPolicy do
  let(:reader) { DeploymentPolicy::UserContext.new build :reader }
  let(:editor) { DeploymentPolicy::UserContext.new build :reader, :editor }

  let(:deployment) { build :deployment }

  subject { described_class }

  permissions :update? do
    it 'does not allow an arbitrary reader to edit a deployment' do
      expect(subject).not_to permit reader, deployment
    end

    it 'does not allow a student enrolled in the case to edit its deployment' do
      reader.enrollments << build(:enrollment, case: deployment.case)
      expect(subject).not_to permit reader, deployment
    end

    it 'allows an instructor to edit her own deployment' do
      reader.enrollments << build(:enrollment, case: deployment.case,
                                               status: :instructor)
      expect(subject).to permit reader, deployment
    end

    it 'allows an unknown user with a valid LTI context to edit deployments ' \
       'that belong to that context' do
      deployment.group.context_id = 'context'
      reader.selection_params = { 'context_id' => 'context' }

      expect(subject).to permit reader, deployment
    end

    it 'allows an editor to edit any deployment' do
      expect(subject).to permit editor, deployment
    end
  end
end
