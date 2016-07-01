class AddOrderToPodcastActivities < ActiveRecord::Migration[5.0]
  def change
    add_column :podcasts, :order, :integer
    add_column :activities, :order, :integer
  end
end
