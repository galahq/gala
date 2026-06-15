# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Reading list saves' do
  it 'saves a reading list for the current reader' do
    reader = create(:reader)
    list = create(:reading_list)
    sign_in reader

    post reading_list_save_path(list)

    expect(response).to have_http_status(:no_content)
    expect(reader.saved_reading_lists.reload).to include(list)
  end

  it 'unsaves a reading list for the current reader' do
    reader = create(:reader)
    list = create(:reading_list)
    create(:reading_list_save, reader: reader, reading_list: list)
    sign_in reader

    delete reading_list_save_path(list)

    expect(response).to have_http_status(:no_content)
    expect(reader.saved_reading_lists.reload).not_to include(list)
  end

  it 'requires authentication' do
    post reading_list_save_path(create(:reading_list))

    expect(response).to redirect_to(new_reader_session_path)
  end
end
