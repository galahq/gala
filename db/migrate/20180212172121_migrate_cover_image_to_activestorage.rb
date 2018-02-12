# frozen_string_literal: true

class MigrateCoverImageToActivestorage < ActiveRecord::Migration[5.2]
  def up
    ActiveJob::Base.queue_adapter = :inline
    Case.find_each do |kase|
      file = open kase.cover_url
      kase.cover_image.attach io: file, filename: 'cover'
    end

    remove_column :cases, :cover_url
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
