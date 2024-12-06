# frozen_string_literal: true

module Admin
  class CasesController < Admin::ApplicationController


    def copy
      current_case = find_resource(params[:id])
      @case = CaseCloneJob.perform_now(
        current_case,
        locale: current_case.locale
      )
      redirect_to(
        admin_case_path(@case),
        case_locale: @case.locale
      )
    end


    private

    def find_resource(param)
      Case.friendly.find param
    end
  end
end
