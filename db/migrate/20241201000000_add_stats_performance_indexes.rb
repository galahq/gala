# frozen_string_literal: true

class AddStatsPerformanceIndexes < ActiveRecord::Migration[5.2]
  def change
    # Add composite index for case_slug and name for faster filtering
    add_index :ahoy_events, "(properties ->> 'case_slug'), name", name: 'index_ahoy_events_on_case_slug_and_name'
    
    # Add index for podcast_id in properties for podcast stats
    add_index :ahoy_events, "(properties ->> 'podcast_id'), name", name: 'index_ahoy_events_on_podcast_id_and_name'
    
    # Add index for time range queries
    add_index :ahoy_events, [:time, :name], name: 'index_ahoy_events_on_time_and_name'
    
    # Add index for user_id and time for faster joins
    add_index :ahoy_events, [:user_id, :time], name: 'index_ahoy_events_on_user_id_and_time'
    
    # Add index for deployments case_id and created_at
    add_index :deployments, [:case_id, :created_at], name: 'index_deployments_on_case_id_and_created_at'
    
    # Add index for readers locale for faster locale aggregation
    add_index :readers, :locale, name: 'index_readers_on_locale'
  end
end
