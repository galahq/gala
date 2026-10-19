# frozen_string_literal: true

# Send a weekly usage report to the Gala team
class ReportMailer < ApplicationMailer
  def weekly_report
    @report = UsageReportsService.new

    # Gala moved from Michigan to Notre Dame; the team reads hello@ now.
    mail to: FROM_ADDRESS, subject: 'Weekly usage report' do |format|
      format.text
      format.html
    end
  end
end
