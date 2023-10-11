# frozen_string_literal: true

module Cases
  # The library a given case belongs to
  class LibrariesController < ApplicationController
    before_action :authenticate_reader!

    # @param [PATCH/PUT] `/cases/case-slug/library`
    def update
      set_case
      set_library
      if policy(@library).update?
        @case.update(library_id: @library.id)
        redirect_to edit_case_settings_path(@case), notice: successfully_updated
      else
        @case.create_active_case_library_request(library: @library,
                                                 requester: current_reader)
        redirect_to edit_case_settings_path(@case),
            notice: t('.created_library_request')
      end
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      authorize @case
    end

    def set_library
      @library = Library.find params.dig(:case, :library_id)
    end
  end
end
