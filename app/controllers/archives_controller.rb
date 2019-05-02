# frozen_string_literal: true

class ArchivesController < ApplicationController
  before_action :authenticate_reader!

  layout 'print'

  # @route [GET] `/cases/case-slug/archive`
  def show
    set_case
    authorize @case
  end

  private

  def set_case
    @case = Case.friendly.find(params[:case_slug])
  end
end
