# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Reader' do

  it 'redirects to :terms_of_service when nil' do
    reader = create :reader, terms_of_service: nil
    sign_in reader
    get cases_url
    expect(response).to redirect_to(edit_tos_reader_path(reader))
  end
  
end
