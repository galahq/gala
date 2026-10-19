# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportMailer do
  describe 'weekly_report' do
    let(:kase) { build_stubbed(:case, kicker: 'Water <b>rights</b>').decorate }
    let(:report) do
      instance_double UsageReportsService,
                      number_of_active_users: 12, number_of_new_users: 3,
                      number_of_new_deployments: 1,
                      number_of_newly_published_cases: 0,
                      number_of_new_enrollments: 4,
                      most_heavily_used_cases: [kase],
                      number_of_new_comments: 7
    end
    let(:mail) { described_class.weekly_report }

    before { allow(UsageReportsService).to receive(:new).and_return(report) }

    it 'goes to the Gala team, not Michigan' do
      expect(mail.to).to eq ['hello@learngala.com']
    end

    it 'renders the HTML part from markdown' do
      html = mail.html_part.body.to_s

      expect(html).to include '<h3>Users</h3>'
      expect(html).to include '<li>We had 12 active users.</li>'
      expect(html).not_to include '###'
    end

    it 'escapes case titles in the HTML part' do
      html = mail.html_part.body.to_s

      expect(html).to include 'Water &lt;b&gt;rights&lt;/b&gt;'
      expect(html).not_to include '<b>rights</b>'
    end

    # The text layout strips tags itself.
    it 'keeps the text part as markdown, without tags' do
      text = mail.text_part.body.to_s

      expect(text).to include '### Users'
      expect(text).to include '+ Water rights'
    end
  end
end
