# frozen_string_literal: true

module Admin
  class CasesController < Admin::ApplicationController
    def copy
      kase = find_resource(params[:id])
      @case = CaseCloner.call(kase, locale: locale)
      @case = @case.to_record
      redirect_to admin_case_path(@case)
    end

    def find_resource(param)
      Case.friendly.find param
    end
  end
end
