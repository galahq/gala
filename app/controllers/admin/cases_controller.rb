# frozen_string_literal: true

module Admin
  class CasesController < Admin::ApplicationController

    def copy
      kase = find_resource(params[:id])
      @case = CaseCloneJob.perform_now(kase, locale: kase.locale)
      @case = @case.to_record
      redirect_to admin_case_path(@case)
    end

    def find_resource(param)
      Case.friendly.find(param)
    end

  end
end
