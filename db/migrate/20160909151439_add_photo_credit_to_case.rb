class AddPhotoCreditToCase < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :photo_credit, :text
    add_column :podcasts, :photo_credit, :text
    add_column :edgenotes, :photo_credit, :text
  end
end
