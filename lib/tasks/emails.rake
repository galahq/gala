# frozen_string_literal: true

namespace :emails do
  desc 'Send a report of the past week’s usage numbers (run daily; sends on Mondays)'
  task send_weekly_report: :environment do
    ReportMailer.send_weekly_report
  end
end
