# frozen_string_literal: true

namespace :accounts do
  desc 'Enqueue the sweep that anonymizes accounts closed more than 30 days ago (daily, Heroku Scheduler)'
  task sweep_closures: :environment do
    AccountDeletionSweepJob.perform_later
  end
end
