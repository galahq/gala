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
    it 'renders the button swap for a granted role' do
      sign_in create(:reader, :editor)

      post reader_roles_path(target, format: :js),
           params: { role: { id: editor_role.id } }

      expect(response).to have_http_status(:ok)
      expect(response.body).to include %([data-reader-id="#{target.id}"])
      expect(response.body).to include 'Remove role'
    end

    it 'renders the button swap for a revoked role' do
      target.add_role :editor
      sign_in create(:reader, :editor)

      delete reader_role_path(target, editor_role, format: :js)

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
