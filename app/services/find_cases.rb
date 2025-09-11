# frozen_string_literal: true

# Find {Case}s matching search parameters
class FindCases
  # @param params [{libraries?: string[], tags?: string[], languages?: string[], q?: string}]
  # @return [ActiveRecord::Relation<Case>]
  def self.by(params, locale:)
    new(params, locale: locale).call
  end

  def initialize(params, locale:)
    @params = params
    @locale = locale
  end

  def call
    base_scope = Case.ordered
                     .merge(maybe_filter_by_library)
                     .merge(maybe_filter_by_tags)
                     .merge(maybe_filter_by_languages)
                     .merge(maybe_search_by_full_text)
    
    # Only apply locale fallback if no specific language filter is applied
    if @params[:languages].present?
      base_scope
    else
      base_scope.with_locale_or_fallback(@locale)
    end
  end

  private

  def maybe_filter_by_library
    return Case.all if @params[:libraries].blank?

    Case.joins('LEFT JOIN libraries ON libraries.id = cases.library_id')
        .where(libraries[:slug].in(@params[:libraries])
                                .or(maybe_shared_library))
        .ordered
  end

  def maybe_shared_library
    if @params[:libraries].include? SharedCasesLibrary.instance.slug
      cases[:library_id].eq(nil)
    else
      cases[:id].eq(-1)
    end
  end

  def maybe_filter_by_tags
    return Case.all if @params[:tags].blank?

    Case.joins(taggings: [:tag])
        .where(taggings: { tags: { name: @params[:tags] } })
  end

  def maybe_filter_by_languages
    return Case.all if @params[:languages].blank?

    Case.where(locale: @params[:languages])
  end

  def maybe_search_by_full_text
    return Case.all if @params[:q].blank?

    Case.joins('JOIN cases_search_index ON cases_search_index.id = cases.id')
        .where('cases_search_index.document @@ plainto_tsquery(?)', query)
        .reorder(
          Arel.sql('ts_rank(' \
             'cases_search_index.document, ' \
             "plainto_tsquery(#{query})" \
           ') DESC')
        )
  end

  def query
    q = @params[:q].is_a?(Array) ? @params[:q].join(' ') : @params[:q]
    ActiveRecord::Base.connection.quote(q.remove('?'))
  end

  def cases
    Case.arel_table
  end

  def libraries
    Library.arel_table
  end
end
