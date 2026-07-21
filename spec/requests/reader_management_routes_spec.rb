# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Reader management routes' do
  it 'renders readers index for an editor' do
    reader = create(:reader, :editor)
    sign_in reader

    get readers_path

    expect(response).to have_http_status(:success)
  end

  it 'lists enrollments as JSON' do
    reader = create(:reader)
    create(:enrollment, reader: reader)
    sign_in reader

    get enrollments_path(format: :json)

    expect(response).to have_http_status(:success)
  end

  it 'creates and destroys an enrollment for a published case' do
    reader = create(:reader)
    kase = create(:case, :published)
    sign_in reader

    post case_enrollment_path(kase)

    expect(response).to have_http_status(:no_content)
    expect(reader.enrollments.where(case: kase)).to exist

    delete case_enrollment_path(kase)

    expect(response).to have_http_status(:no_content)
    expect(reader.enrollments.where(case: kase)).not_to exist
  end

  it 'renders my cases for an editor' do
    reader = create(:reader, :editor)
    sign_in reader

    get my_cases_path

    expect(response).to have_http_status(:success)
  end

  it 'renders the new editorship form for a case editor' do
    reader = create(:reader)
    kase = create(:case)
    kase.editors << reader
    sign_in reader

    get new_case_editorship_path(kase)

    expect(response).to have_http_status(:success)
  end

  it 'creates and destroys an editorship for a case editor' do
    reader = create(:reader)
    new_editor = create(:reader)
    kase = create(:case)
    kase.editors << reader
    sign_in reader

    post case_editorships_path(kase),
         params: { editorship: { editor_email: new_editor.email } }

    expect(response).to redirect_to(edit_case_settings_path(kase))
    expect(kase.editors.reload).to include(new_editor)

    editorship = kase.editorships.find_by!(editor: new_editor)
    delete editorship_path(editorship)

    expect(response).to redirect_to(edit_case_settings_path(kase))
    expect(kase.editors.reload).not_to include(new_editor)
  end

  it 'adds and removes a reader role' do
    editor = create(:reader, :editor)
    reader = create(:reader)
    role = Role.find_or_create_by!(name: 'invisible')
    sign_in editor

    post reader_roles_path(reader), params: { role: { id: role.id } }

    expect(response).to have_http_status(:no_content)
    expect(reader.reload.has_role?(:invisible)).to be(true)

    delete reader_role_path(reader, role)

    expect(response).to have_http_status(:no_content)
    expect(reader.reload.has_role?(:invisible)).to be(false)
  end
end
