# frozen_string_literal: true

class CaseServiceWorkersController < ApplicationController
  def show
    @case = Case.find_by_slug params[:case_slug]
  end
end
