# frozen_string_literal: true

class CaseManifestsController < ApplicationController
  def show
    @case = Case.find_by_slug params[:case_slug]
  end
end
