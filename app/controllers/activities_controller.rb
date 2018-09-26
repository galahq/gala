# frozen_string_literal: true

# @see ActivityCreator
class ActivitiesController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :authenticate_reader!
  before_action :set_case, only: [:create]

  broadcast_edits to: :@page
  broadcast_edits to: :@card
  broadcast_edits to: :@edgenote

  # @route [POST] `/cases/case-slug/activities`
  def create
    authorize @case, :update?
    creator = ActivityCreator.for @case

    @page = creator.page
    @card = creator.card
    @edgenote = creator.edgenote.decorate

    render json: {
      page:     ActiveModel::Serializer.for(@page),
      card:     ActiveModel::Serializer.for(@card),
      edgenote: ActiveModel::Serializer.for(@edgenote)
    }
  end

  private

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end
end
