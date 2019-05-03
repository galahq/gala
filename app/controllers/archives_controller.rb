# frozen_string_literal: true

# Render PDF archives of cases
class ArchivesController < ApplicationController
  EAGER_LOADING_CONFIG = [
    :cards,
    edgenotes: [
      audio_attachment: :blob,
      file_attachment: :blob,
      image_attachment: :blob
    ],
    case_elements: :element
  ].freeze
  before_action :authenticate_reader!

  layout 'print'

  # @route [GET] `/cases/case-slug/archive`
  def show
    set_case
    authorize @case
  end

  private

  def set_case
    @case = Case.friendly
                .includes(EAGER_LOADING_CONFIG)
                .find(params[:case_slug])
                .decorate
  end
end
