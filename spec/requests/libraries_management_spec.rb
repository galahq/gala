# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Libraries management routes' do
  it 'renders the libraries index' do
    create(:library)

    get libraries_path

    expect(response).to have_http_status(:success)
  end

  it 'shows a library as JSON' do
    library = create(:library)

    get library_path(library, format: :json)

    expect(response).to have_http_status(:success)
  end

  it 'renders library edit for a manager' do
    manager = create(:reader)
    library = create(:library)
    create(:managership, library: library, manager: manager)
    sign_in manager

    get edit_library_path(library)

    expect(response).to have_http_status(:success)
  end

  it 'updates a managed library' do
    manager = create(:reader)
    library = create(:library)
    create(:managership, library: library, manager: manager)
    sign_in manager

    patch library_path(library), params: { library: { name: 'Phase 6 Library' } }

    expect(response).to redirect_to(edit_library_path(library.reload))
    expect(library.name).to eq('Phase 6 Library')
  end

  it 'renders the new managership form for a manager' do
    manager = create(:reader)
    library = create(:library)
    create(:managership, library: library, manager: manager)
    sign_in manager

    get new_library_managership_path(library)

    expect(response).to have_http_status(:success)
  end

  it 'creates a managership for a managed library' do
    manager = create(:reader)
    new_manager = create(:reader)
    library = create(:library)
    create(:managership, library: library, manager: manager)
    sign_in manager

    post library_managerships_path(library),
         params: { managership: { manager_email: new_manager.email } }

    expect(response).to redirect_to(edit_library_path(library))
    expect(library.managers.reload).to include(new_manager)
  end

  it 'lists current reader managerships as JSON' do
    manager = create(:reader)
    library = create(:library)
    create(:managership, library: library, manager: manager)
    sign_in manager

    get managerships_path

    expect(response).to have_http_status(:success)
    expect(response.body).to include(library.slug)
  end

  it 'destroys a managership for a managed library' do
    manager = create(:reader)
    library = create(:library)
    create(:managership, library: library, manager: manager)
    extra = create(:managership, library: library)
    sign_in manager

    delete managership_path(extra)

    expect(response).to redirect_to(edit_library_path(library))
    expect(Managership.exists?(extra.id)).to be(false)
  end

  it 'lists pending case library requests for a manager' do
    manager = create(:reader)
    requester = create(:reader)
    library = create(:library)
    kase = create(:case, library: library)
    create(:managership, library: library, manager: manager)
    CaseLibraryRequest.create!(case: kase, library: library, requester: requester)
    sign_in manager

    get case_library_requests_path

    expect(response).to have_http_status(:success)
    expect(response.body).to include(requester.name)
    expect(response.body).to include('pending')
  end

  it 'accepts a case library request for a manager' do
    manager = create(:reader)
    requester = create(:reader)
    source_library = create(:library)
    target_library = create(:library)
    kase = create(:case, library: source_library)
    request = CaseLibraryRequest.create!(
      case: kase,
      library: target_library,
      requester: requester
    )
    create(:managership, library: target_library, manager: manager)
    sign_in manager

    patch case_library_request_path(request),
          params: { case_library_request: { status: 'accepted' } }

    expect(response).to redirect_to(edit_library_path(target_library))
    expect(kase.reload.library).to eq(target_library)
  end
end
