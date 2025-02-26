# Frozen_string_literal: true

# Refresh all indices after a case is created
class RefreshIndicesJob < ApplicationJob
  queue_as :default

  def perform
    ActiveRecord::Base.connection.execute <<~SQL
      REFRESH MATERIALIZED VIEW cases_search_index;
    SQL
  end
end
