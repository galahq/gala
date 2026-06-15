# frozen_string_literal: true

# The case catalog is searchable.
# @see FindCases
class SearchController < ApplicationController
  # @route [GET] `/search.json`
  def index
    results = FindCases.by params, locale: current_user.locale
    @cases = policy_scope(results).pluck(:slug).uniq
    render json: @cases
  rescue ActiveRecord::StatementInvalid => e
    raise unless unpopulated_search_index?(e)

    Rails.logger.warn(
      'Search index is not populated; returning empty catalog search results'
    )
    render json: []
  end

  private

  def policy_scope(scope)
    CasePolicy::Scope.new(current_user, scope).resolve
  end

  def unpopulated_search_index?(error)
    error.cause.is_a?(PG::ObjectNotInPrerequisiteState) &&
      error.message.include?('cases_search_index')
  end
end
