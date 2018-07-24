# frozen_string_literal: true

# @see Tagging
class TaggingsController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :authenticate_reader!
  before_action :set_case
  before_action -> { verify_lock_on @case }

  broadcast_edits to: :@case, type: :update

  # @route [POST] `/cases/case-slug/taggings`
  def create
    tagging = @case.tag params[:tagging][:tag_name]
    render json: tagging.tag, status: :created
  end

  # @route [DELETE] `/cases/case-slug/taggings/tag_name`
  def destroy
    @case.untag params[:tag_name]
    head :no_content
  end

  private

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end
end
