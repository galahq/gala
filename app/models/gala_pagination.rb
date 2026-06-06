# frozen_string_literal: true

module GalaPagination
  DEFAULT_PER_PAGE = 25

  module_function

  def paginate_relation(scope, page:, per_page: DEFAULT_PER_PAGE)
    page = normalize_page(page)
    per_page = normalize_per_page(per_page)
    total_count = scope.count
    offset = (page - 1) * per_page

    Collection.new(
      scope.limit(per_page).offset(offset).to_a,
      current_page: page,
      per_page: per_page,
      total_count: total_count
    )
  end

  def paginate_array(records, page:, per_page: DEFAULT_PER_PAGE)
    page = normalize_page(page)
    per_page = normalize_per_page(per_page)
    records = records.to_a
    offset = (page - 1) * per_page

    Collection.new(
      records.slice(offset, per_page) || [],
      current_page: page,
      per_page: per_page,
      total_count: records.length
    )
  end

  def normalize_page(value)
    page = value.to_i
    page.positive? ? page : 1
  end

  def normalize_per_page(value)
    per_page = value.to_i
    per_page.positive? ? per_page : DEFAULT_PER_PAGE
  end

  class Collection
    include Enumerable

    attr_reader :records, :current_page, :per_page, :total_count

    alias limit_value per_page

    def initialize(records, current_page:, per_page:, total_count:)
      @records = records
      @current_page = current_page
      @per_page = per_page
      @total_count = total_count
    end

    def each(&block)
      records.each(&block)
    end

    def length
      records.length
    end

    alias size length

    def empty?
      records.empty?
    end

    def total_pages
      return 1 if total_count.zero?

      (total_count / per_page.to_f).ceil
    end

    def offset_value
      (current_page - 1) * per_page
    end

    def first_page?
      current_page <= 1
    end

    def last_page?
      current_page >= total_pages
    end

    def prev_page
      current_page - 1 unless first_page?
    end

    def next_page
      current_page + 1 unless last_page?
    end

    def first_item_index
      return 0 if total_count.zero?

      offset_value + 1
    end

    def last_item_index
      [offset_value + length, total_count].min
    end
  end
end
