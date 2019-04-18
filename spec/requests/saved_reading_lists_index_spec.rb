# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Saved reading lists index' do
  it 'lists the user’s saved reading lists' do
    list1 = create :reading_list, title: 'Reading List 1'
    list2 = create :reading_list, title: 'Reading List 2'
    create :reading_list, title: 'Reading List 3'

    reader = create :reader
    reader.saved_reading_lists << list1
    reader.saved_reading_lists << list2

    sign_in reader
    get saved_reading_lists_path

    expect(response.body).to be_json including(
      including(title: 'Reading List 1'),
      including(title: 'Reading List 2')
    )

    expect(response.body).not_to be_json including(
      including(title: 'Reading List 3')
    )
  end

  it 'includes the case slugs for the reading list items' do
    list = create :reading_list
    list.cases << create(:case, slug: 'case-slug')

    reader = create :reader
    reader.saved_reading_lists << list

    sign_in reader
    get saved_reading_lists_path

    expect(response.body).to be_json including(
      including(caseSlugs: including('case-slug'))
    )
  end
end
