# frozen_string_literal: true

class MigrateActivitiesToActiveStorage < ActiveRecord::Migration[5.2]
  class Uploader
    def initialize(activity)
      @activity = activity
    end

    def upload(attachment)
      url = url attachment
      return if url.blank?
      @activity.send(attachment)
               .attach io: open(url),
                       filename: "#{@activity.case.slug}_activity_#{attachment}"
    end

    private

    def url(attachment)
      @activity.send(:"#{attachment}_url").try(:[], 'en').tap do |url|
        break if url.blank?
        puts "-- #{url}"
      end
    end
  end

  def up
    ActiveJob::Base.queue_adapter = :inline

    Activity.find_each do |activity|
      uploader = Uploader.new activity
      uploader.upload :pdf
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
