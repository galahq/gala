# frozen_string_literal: true

# The case catalog is searchable.
# @see FindCases
class SearchController < ApplicationController
  # @route [GET] `/search.json`
  def index
    results = FindCases.by params, locale: current_user.locale
    @cases = policy_scope(results).pluck(:slug).uniq
    render json: @cases
  end

  private

  def policy_scope(scope)
    CasePolicy::Scope.new(current_user, scope).resolve
  end
end
