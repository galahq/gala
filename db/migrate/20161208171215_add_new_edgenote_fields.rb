class AddNewEdgenoteFields < ActiveRecord::Migration[5.0]
  def change
    add_column :edgenotes, :style, :integer, default: 0
    add_column :edgenotes, :pull_quote_i18n, :hstore
    add_column :edgenotes, :attribution_i18n, :hstore
    add_column :edgenotes, :call_to_action_i18n, :hstore
    add_column :edgenotes, :audio_url_i18n, :hstore
    add_column :edgenotes, :youtube_slug_i18n, :hstore
  end
end
