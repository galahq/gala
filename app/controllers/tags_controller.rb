# frozen_string_literal: true

# @see Tag
class TagsController < ApplicationController
  # @route [GET] `/tags`
  def index
    @tags = Tag.most_popular
               .yield_self(&method(:filtered))
               .yield_self(&method(:matching_query))
               .sort_by(&:display_name)

    render json: @tags
  end

  private

  def filtered(relation)
    return relation if params[:q].present?
    relation.part_of_catalog
  end

  def matching_query(relation)
    return relation unless params[:q].present?
    relation.where <<~SQL.squish, q: params[:q]
      (tags.display_name #>> '{}') ILIKE '%' || :q || '%'
    SQL
  end
end
