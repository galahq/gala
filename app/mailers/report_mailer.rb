# frozen_string_literal: true

class ReportMailer < ApplicationMailer
  def weekly_report
    @report = UsageReportsService.new

    mail to: 'msc-contact@umich.edu', subject: 'Weekly usage report' do |format|
      format.text
      format.html
    end
  end
end
