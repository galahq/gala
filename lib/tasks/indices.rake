# frozen_string_literal: true

namespace :indices do
  desc 'Refresh the index for full-text searching of cases'
  task refresh: :environment do
    RefreshIndicesJob.perform_now
  end
end
