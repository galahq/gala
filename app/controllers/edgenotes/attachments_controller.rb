# frozen_string_literal: true

module Edgenotes
  # Allow {Edgenote} attachments to be detached
  class AttachmentsController < ApplicationController
    ATTACHMENT_ATTRIBUTES = %w[image audio].freeze

    # @param [DELETE] `/edgenotes/slug/attachments/attribute`
    def destroy
      return head :not_found unless set_edgenote && set_attachment
      authorize @edgenote.case, :update?

      @attachment.detach

      head :no_content
    end

    private

    def set_edgenote
      @edgenote = Edgenote.find_by slug: params[:edgenote_slug]
    end

    def set_attachment
      return nil unless ATTACHMENT_ATTRIBUTES.include? params[:attribute]
      @attachment = @edgenote.send params[:attribute]
    end
  end
end
