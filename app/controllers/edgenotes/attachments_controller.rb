# frozen_string_literal: true

module Edgenotes
  # Allow {Edgenote} attachments to be detached
  class AttachmentsController < ::AttachmentsController
    model -> { Edgenote.find_by slug: params[:edgenote_slug] }
    permit_attributes :image, :audio, :file
    authorize_action ->(model) { authorize model.case, :update? }
  end
end
