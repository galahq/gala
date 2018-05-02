# frozen_string_literal: true

class MigratePodcastsToActiveStorage < ActiveRecord::Migration[5.2]
  class Uploader
    def initialize(podcast)
      @podcast = podcast
    end

    def upload(attachment)
      url = url attachment
      return if url.blank?
      @podcast.send(attachment)
              .attach io: open(url),
                      filename: "#{@podcast.case.slug}_podcast_#{attachment}"
    end

    private

    def url(attachment)
      unpacked(@podcast.send(:"#{attachment}_url")).tap do |url|
        break if url.blank? || url.end_with?('.pdf')
        puts "-- #{url}"
      end
    end

    def unpacked(maybe_translated_url)
      return maybe_translated_url unless maybe_translated_url.respond_to? :key?
      maybe_translated_url['en']
    end
  end

  def up
    ActiveJob::Base.queue_adapter = :inline

    Podcast.find_each do |podcast|
      uploader = Uploader.new podcast
      uploader.upload :artwork
      uploader.upload :audio
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
