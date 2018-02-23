# frozen_string_literal: true

module Cases
  # The settings for a {Case} include its slug, what library it is in, etc.
  class SettingsController < ApplicationController
    before_action :authenticate_reader!

    layout 'admin'

    # @param [GET] /cases/case-slug/settings/edit
    def edit
      set_case
      set_libraries
    end

    # @param [PATCH/PUT] /cases/case-slug/settings
    def update
      set_case

      if @case.update(case_settings_params)
        redirect_to edit_case_settings_path(@case), notice: t('.updated')
      else
        set_libraries
        render :edit
      end
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
    end

    def set_libraries
      @libraries = Pundit.policy_scope!(current_reader, Library)
    end

    def case_settings_params
      params.require(:case).permit(:slug, :library_id)
    end
  end
end
