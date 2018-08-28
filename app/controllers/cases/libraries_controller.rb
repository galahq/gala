# frozen_string_literal: true

module Cases
  # The library a given case belongs to
  class LibrariesController < ApplicationController
    before_action :authenticate_reader!

    # @param [PATCH/PUT] `/cases/case-slug/library`
    def update
      set_case
      set_library
      @case.update library_id: @library.id
      redirect_to edit_case_settings_path(@case), notice: successfully_updated
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      authorize @case
    end

    def set_library
      @library = Library.find params.dig(:case, :library_id)
      authorize @library
    end
  end
end
