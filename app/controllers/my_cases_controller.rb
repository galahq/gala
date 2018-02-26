# frozen_string_literal: true

# This controller display and manages what cases a given user is allowed to edit
class MyCasesController < ApplicationController
  before_action :authenticate_reader!

  layout 'admin'

  def index
    @cases = find_cases.decorate
  end

  private

  def find_cases
    CasePolicy::AdminScope.new(current_user, Case).resolve
                          .ordered
                          .with_attached_cover_image
                          .includes(:case_elements, :library)
  end
end
