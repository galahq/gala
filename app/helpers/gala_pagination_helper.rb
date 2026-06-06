# frozen_string_literal: true

module GalaPaginationHelper
  def link_to_previous_page(collection, name = nil, options = {})
    page = collection.prev_page if collection.respond_to?(:prev_page)
    return nil unless page

    link_to_pagination_page(page, name || t('views.pagination.previous'), options)
  end

  def link_to_next_page(collection, name = nil, options = {})
    page = collection.next_page if collection.respond_to?(:next_page)
    return nil unless page

    link_to_pagination_page(page, name || t('views.pagination.next'), options)
  end

  def page_entries_info(collection, entry_name: nil, **)
    entry_name = entry_name.to_s.presence || 'entry'
    total = collection.total_count

    return t('helpers.page_entries_info.empty',
             entry_name: entry_name.pluralize,
             default: "No #{entry_name.pluralize} found") if total.zero?

    if collection.total_pages <= 1
      return t('helpers.page_entries_info.one_page.display_entries',
               count: total,
               entry_name: entry_name.pluralize(total),
               default: "Displaying all #{total} #{entry_name.pluralize(total)}")
    end

    t('helpers.page_entries_info.more_pages.display_entries',
      entry_name: entry_name,
      first: collection.first_item_index,
      last: collection.last_item_index,
      total: total,
      default: 'Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total').html_safe
  end

  private

  def link_to_pagination_page(page, name, options)
    query_parameters = request.query_parameters.merge('page' => page)
    query_parameters.delete('page') if page == 1

    query_string = query_parameters.to_query
    path = query_string.present? ? "#{request.path}?#{query_string}" : request.path

    link_to name, path, options
  end
end
