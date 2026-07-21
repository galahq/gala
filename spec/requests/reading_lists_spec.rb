# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Reading lists' do
  it 'requires authentication for the new form' do
    get new_reading_list_path

    expect(response).to redirect_to(new_reader_session_path)
  end

  it 'renders the new form for a signed-in reader' do
    sign_in create(:reader)

    get new_reading_list_path

    expect(response).to have_http_status(:success)
  end

  it 'creates a reading list for the current reader' do
    reader = create(:reader)
    sign_in reader

    post reading_lists_path,
         params: { reading_list: { title: 'Phase 6 List', description: 'QA' } }

    list = ReadingList.find_by!(title: 'Phase 6 List')
    expect(response).to redirect_to(reading_list_path(list))
    expect(list.reader).to eq(reader)
  end

  it 'shows a public reading list' do
    list = create(:reading_list)

    get reading_list_path(list)

    expect(response).to have_http_status(:success)
  end

  it 'returns not found for a malformed reading list UUID' do
    get reading_list_path('missing-reading-list')

    expect(response).to have_http_status(:not_found)
  end

  it 'returns not found for a valid but missing reading list UUID' do
    get reading_list_path('00000000-0000-4000-8000-000000000000')

    expect(response).to have_http_status(:not_found)
  end

  it 'renders the edit form for the owner' do
    list = create(:reading_list)
    sign_in list.reader

    get edit_reading_list_path(list)

    expect(response).to have_http_status(:success)
  end

  it 'updates nested reading-list items by case slug' do
    reader = create(:reader)
    kase = create(:case, slug: 'phase-6-case')
    list = create(:reading_list, reader: reader)
    sign_in reader

    patch reading_list_path(list),
          params: {
            reading_list: {
              title: 'Updated Phase 6 List',
              description: 'Updated',
              reading_list_items_attributes: {
                '0' => {
                  position: 1,
                  notes: 'Use for Phase 6 QA',
                  case_slug: kase.slug
                }
              }
            }
          }

    expect(response).to redirect_to(reading_list_path(list))
    expect(list.reload.title).to eq('Updated Phase 6 List')
    expect(list.reading_list_items.first.case).to eq(kase)
    expect(list.reading_list_items.first.notes).to eq('Use for Phase 6 QA')
  end

  it 'destroys a reading list owned by the current reader' do
    list = create(:reading_list)
    sign_in list.reader

    delete reading_list_path(list)

    expect(response).to redirect_to(root_path)
    expect(ReadingList.exists?(list.id)).to be(false)
  end
end
