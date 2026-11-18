# frozen_string_literal: true

require 'rails_helper'

# The site footer: who holds the copyright, and where the policies live.
RSpec.describe 'Site footer' do
  it 'names both copyright holders and links the policies' do
    get new_reader_session_path

    footer = Nokogiri::HTML.parse(response.body).at_css('footer.footer')
    policies = footer.at_css('a[href="https://docs.learngala.com/policies"]')

    expect(footer.at_css('.footer__copyright').text.squish).to end_with(
      'The University of Notre Dame and The Regents of the University of Michigan'
    )
    expect(policies.text.strip).to eq I18n.t('application.footer.policies')
    expect(policies.at_css('.translation_missing')).to be_nil
  end
end
