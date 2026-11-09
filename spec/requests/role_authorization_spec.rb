# frozen_string_literal: true

require 'rails_helper'

# Regression guard for the privilege-escalation hole where RolesController had
# neither authentication nor authorization: any anonymous request could grant
# itself the global :editor role (the master key to every admin surface).
RSpec.describe 'Role assignment authorization' do
  let(:target) { create(:reader) }
  let(:editor_role) { Role.find_or_create_by(name: :editor) }

  # The React client posts these as JSON (via Orchard); JSON is also the format
  # that yields the clean 401/403 statuses (the HTML branch redirects to /403).
  describe 'POST /readers/:reader_id/roles' do
    it 'rejects an anonymous request and grants no role' do
      post reader_roles_path(target, format: :json),
           params: { role: { id: editor_role.id } }

      expect(response).to have_http_status(:unauthorized)
      expect(target.reload.has_role?(:editor)).to be false
    end

    it 'rejects a signed-in non-editor and grants no role' do
      sign_in create(:reader)

      post reader_roles_path(target, format: :json),
           params: { role: { id: editor_role.id } }

      expect(response).to have_http_status(:forbidden)
      expect(target.reload.has_role?(:editor)).to be false
    end

    it 'allows an editor to grant a role' do
      sign_in create(:reader, :editor)

      post reader_roles_path(target, format: :json),
           params: { role: { id: editor_role.id } }

      expect(response).to have_http_status(:no_content)
      expect(target.reload.has_role?(:editor)).to be true
    end
  end

  # The buttons on /readers post with `remote: true`, so a click asks for
  # JavaScript and expects create.js.erb / destroy.js.erb to swap the button.
  # `5af07647` answered `head :no_content` instead, which granted the role and
  # left the button still reading "Make editor" — it looked broken.
  describe 'the JavaScript response the buttons ask for' do
    # What rails-ujs actually sends, rather than a `.js` path extension: the
    # extension bypasses negotiation entirely, so it would pass whatever order
    # the formats are declared in. `X-Requested-With` matters as much as the
    # Accept header — Rails ignores an Accept containing `, */*` as
    # browser-generated unless the request is an XHR, so without it this
    # negotiates to HTML.
    UJS_HEADERS = {
      'HTTP_ACCEPT' => 'text/javascript, application/javascript, ' \
                       'application/ecmascript, application/x-ecmascript, */*; q=0.01',
      'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'
    }.freeze

    it 'renders the button swap for a granted role' do
      sign_in create(:reader, :editor)

      post reader_roles_path(target),
           params: { role: { id: editor_role.id } },
           headers: UJS_HEADERS

      expect(response).to have_http_status(:ok)
      expect(response.body).to include %([data-reader-id="#{target.id}"])
      expect(response.body).to include 'Remove role'
    end

    # `negotiate_mime` returns the first declared format the moment it meets
    # `*/*`, so declaring `format.js` first would hand a bare curl or a fetch
    # with no Accept header an executable response where it expects 204.
    it 'answers a request that accepts anything with no content' do
      sign_in create(:reader, :editor)

      post reader_roles_path(target),
           params: { role: { id: editor_role.id } },
           headers: { 'HTTP_ACCEPT' => '*/*' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
      expect(target.reload.has_role?(:editor)).to be true
    end

    it 'answers the JSON client by Accept header, not just by extension' do
      sign_in create(:reader, :editor)

      post reader_roles_path(target),
           params: { role: { id: editor_role.id } },
           headers: { 'HTTP_ACCEPT' => 'application/json' }

      expect(response).to have_http_status(:no_content)
      expect(target.reload.has_role?(:editor)).to be true
    end

    it 'renders the button swap for a revoked role' do
      target.add_role :editor
      sign_in create(:reader, :editor)

      delete reader_role_path(target, editor_role),
             headers: UJS_HEADERS

      expect(response).to have_http_status(:ok)
      expect(response.body).to include %([data-reader-id="#{target.id}"])
      expect(response.body).to include 'Make editor'
    end

    # The React client posts JSON and wants no body; Rails's own
    # missing-template behaviour for a non-GET request still gives it 204.
    it 'still answers a JSON post with no content' do
      sign_in create(:reader, :editor)

      post reader_roles_path(target, format: :json),
           params: { role: { id: editor_role.id } }

      expect(response).to have_http_status(:no_content)
      expect(target.reload.has_role?(:editor)).to be true
    end
  end

  describe 'DELETE /readers/:reader_id/roles/:id' do
    before { target.add_role :editor }

    it 'rejects a signed-in non-editor and leaves the role intact' do
      sign_in create(:reader)

      delete reader_role_path(target, editor_role, format: :json)

      expect(response).to have_http_status(:forbidden)
      expect(target.reload.has_role?(:editor)).to be true
    end

    it 'allows an editor to revoke a role' do
      sign_in create(:reader, :editor)

      delete reader_role_path(target, editor_role, format: :json)

      expect(response).to have_http_status(:no_content)
      expect(target.reload.has_role?(:editor)).to be false
    end
  end
end
