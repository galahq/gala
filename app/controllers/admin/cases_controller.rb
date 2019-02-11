# frozen_string_literal: true

module Admin
  class CasesController < Admin::ApplicationController
    private

    def find_resource(param)
      Case.friendly.find param
    end
  end
end
