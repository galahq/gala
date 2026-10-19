# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsageReportsService do
  # Memoist 0.16 broke this keyword argument on Ruby 3, and the weekly report
  # raised before it sent.
  it 'finds the most heavily used cases by keyword limit' do
    expect(described_class.new.most_heavily_used_cases(limit: 5)).to eq []
  end

  it 'builds the weekly report from the real numbers' do
    mail = ReportMailer.weekly_report

    expect(mail.html_part.body.to_s).to include '<h3>Users</h3>'
  end
end
