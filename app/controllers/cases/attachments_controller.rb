# frozen_string_literal: true

module Cases
  # Allow {Case} teaching guides to be deleted
  class AttachmentsController < ::AttachmentsController
    model -> { Case.friendly.find params[:case_slug] }
    permit_attributes :teaching_guide
    authorize_action ->(model) { authorize model, :update? }
  end
end
