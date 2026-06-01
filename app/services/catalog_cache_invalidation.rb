# frozen_string_literal: true

# Centralized helper for invalidating catalog caches when case-backed edits occur.
class CatalogCacheInvalidation
  CATALOG_CACHE_PATTERNS = %w[
    home/cases/*
    cases-preview/*
    case-features/*
    catalog-languages/*
    catalog-libraries/*
    catalog-tags/*
    cases/show/*
  ].freeze

  class << self
    def invalidate_case_edit_caches
      cache_scope_prefix = "#{ENV.fetch('RAILS_ENV', 'production')}/catalog"
      CATALOG_CACHE_PATTERNS.each do |pattern|
        Rails.cache.delete_matched("#{cache_scope_prefix}/#{pattern}")
      end
    end
  end
end
