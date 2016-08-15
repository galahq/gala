class AddPositionToPodcastActivities < ActiveRecord::Migration[5.0]
  def change
    add_column :podcasts, :position, :integer
    add_column :activities, :position, :integer
  end
end
