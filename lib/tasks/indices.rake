# frozen_string_literal: true

namespace :indices do
  desc 'Refresh the index for full-text searching of cases'
  task refresh: :environment do
    ActiveRecord::Base.connection.execute <<~SQL
      REFRESH MATERIALIZED VIEW cases_search_index;
    SQL
  end
end
