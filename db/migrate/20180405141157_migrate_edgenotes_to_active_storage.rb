# frozen_string_literal: true

class MigrateEdgenotesToActiveStorage < ActiveRecord::Migration[5.2]
  class Uploader
    def initialize(edgenote)
      @edgenote = edgenote
    end

    def upload(attachment)
      url = url attachment
      return if url.blank?
      @edgenote.send(attachment)
               .attach io: open(url),
                       filename: "#{@edgenote.slug}_#{attachment}"
    end

    private

    def url(attachment)
      @edgenote.send(:"#{attachment}_url").try(:[], 'en').tap do |url|
        return if url.blank? || url.end_with?('.pdf')
        puts "-- #{url}"
      end
    end
  end

  def up
    ActiveJob::Base.queue_adapter = :inline

    Edgenote.find_each do |edgenote|
      uploader = Uploader.new edgenote
      uploader.upload :image
      uploader.upload :audio
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
