# frozen_string_literal: true

# The case catalog is searchable.
# @see FindCases
class SearchController < ApplicationController
  # @route [GET] `/search.json`
  def index
    @cases = policy_scope(FindCases.by(params)).pluck(:slug)
    render json: @cases
  end

  private

  def policy_scope(scope)
    CasePolicy::Scope.new(current_user, scope).resolve
  end
end
