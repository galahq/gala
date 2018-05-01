# frozen_string_literal: true

class MigrateEdgenotesToEmbeddedYoutube < ActiveRecord::Migration[5.2]
  class MigrationEdgenote < ApplicationRecord
    self.table_name = 'edgenotes'
  end

  def up
    MigrationEdgenote.find_each do |edgenote|
      slug = edgenote.youtube_slug.try(:[], 'en')
      next if slug.blank?
      puts "-- #{slug}"
      edgenote.update website_url: {
        en: "https://www.youtube.com/watch?v=#{slug}"
      }
    end

    remove_column :edgenotes, :youtube_slug
  end

  def down
    add_column :edgenotes, :youtube_slug, :jsonb, default: ''

    MigrationEdgenote.find_each do |edgenote|
      url = edgenote.website_url
      next unless url.try :start_with?, 'https://www.youtube.com'
      slug = url[/youtube.com\/watch\?v=(?<slug>.+)$/, 'slug']
      edgenote.update youtube_slug: { en: slug }
    end
  end
end
