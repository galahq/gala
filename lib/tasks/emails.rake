# frozen_string_literal: true

namespace :emails do
  desc 'Send a report of the past week’s usage numbers'
  task send_weekly_report: :environment do
    ReportMailer.weekly_report.deliver
  end
end
