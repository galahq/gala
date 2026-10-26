# frozen_string_literal: true

# Send a weekly usage report to the Gala team
class ReportMailer < ApplicationMailer
  # Heroku Scheduler runs tasks at most daily, so `rake
  # emails:send_weekly_report` runs every day and sends only on Mondays.
  def self.send_weekly_report(now: Time.current)
    return unless now.monday?

    weekly_report.deliver_now
  end

  def weekly_report
    @report = UsageReportsService.new

    # Gala moved from Michigan to Notre Dame; the team reads hello@ now.
    mail to: FROM_ADDRESS, subject: 'Weekly usage report' do |format|
      format.text
      format.html
    end
  end
end
