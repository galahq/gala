namespace :locks do
  desc 'Enqueue CleanupLocksJob for a specific reader or old locks'
  task enqueue_cleanup: :environment do
    reader_id = ENV['READER_ID']
    destroy_after = ENV['DESTROY_AFTER'] || 8.hours.to_i

    CleanupLocksJob.perform_later(reader_id: reader_id, destroy_after: destroy_after)
  end
end