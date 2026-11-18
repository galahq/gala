# frozen_string_literal: true

require 'rails_helper'

# The site footer: who holds the copyright, and where the policies live.
RSpec.describe 'Site footer' do
  it 'names both copyright holders and links the policies' do
    get new_reader_session_path

    expect(response.body).to include 'The University of Notre Dame and The Regents of the University of Michigan'
    expect(response.body).to include 'href="https://docs.learngala.com/policies"'
    expect(response.body).to include I18n.t('application.footer.policies')
  end
end
