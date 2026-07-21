# frozen_string_literal: true

# @see Tag
class TagsController < ApplicationController
  include PublicCatalogCache

  # @route [GET] `/tags`
  def index
    @tags = Tag
            .yield_self(&method(:filtered))
            .yield_self(&method(:matching_query))
            .most_popular
            .sort_by(&:display_name)

    if anonymous_json_catalog_request?
      render_public_catalog_json(
        ['catalog-tags', I18n.locale.to_s, catalog_cache_timestamp(Tag)],
        json: @tags
      )
      return
    end

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
