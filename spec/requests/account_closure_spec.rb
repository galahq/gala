# frozen_string_literal: true

require 'rails_helper'

# A reader closing their own account (register A22, A23), and support
# restoring one (grace-state rule W10).
RSpec.describe 'Closing an account' do
  let(:reader) { create :reader, name: 'Jordan Real', password: 'secret' }

  describe 'the settings page' do
    it 'links to the close page' do
      sign_in reader

      get edit_profile_path

      expect(response.body).to include new_account_closure_path
      expect(response.body).to include I18n.t('readers.form.close_my_account')
    end
  end

  describe 'the close page' do
    before { sign_in reader }

    it 'explains what happens before asking for confirmation' do
      get new_account_closure_path

      expect(response).to have_http_status(:ok)
      expect(response.body).to include I18n.t('account_closures.new.hidden.heading')
      expect(response.body).to include I18n.t('account_closures.new.kept.heading')
      expect(response.body).to include ApplicationMailer::FROM_ADDRESS
    end

    it 'does not warn a reader who runs no classes' do
      get new_account_closure_path

      expect(response.body).not_to include 'classes on Gala'
    end

    it 'warns an instructor how many classes they run (A23)' do
      group = create :group
      create :group_membership, group: group, reader: reader, status: :admin
      create_list :deployment, 2, group: group
      student_group = create :group
      create :group_membership, group: student_group, reader: reader
      create :deployment, group: student_group

      get new_account_closure_path

      expect(response.body).to include 'You run 2 classes on Gala.'
    end
  end

  describe 'confirming' do
    before { sign_in reader }

    it 'refuses the wrong email address and closes nothing' do
      post account_closure_path, params: { email: 'someone-else@example.com' }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include CGI.escapeHTML(I18n.t('account_closures.new.email_mismatch'))
      expect(reader.reload).not_to be_closed
    end

    it 'refuses a blank email address' do
      post account_closure_path, params: { email: '' }

      expect(reader.reload).not_to be_closed
    end

    it 'closes the account, signs the reader out and says so' do
      post account_closure_path, params: { email: " #{reader.email.upcase} " }

      expect(reader.reload).to be_closed
      expect(response).to redirect_to root_path
      expect(flash[:notice]).to eq I18n.t('account_closures.create.closed')

      get edit_profile_path
      expect(response).to redirect_to new_reader_session_path
    end

    it 'sends one confirmation email with the deletion date (W6)' do
      expect do
        post account_closure_path, params: { email: reader.email }
      end.to change(ActionMailer::Base.deliveries, :count).by(1)

      mail = ActionMailer::Base.deliveries.last
      date = reader.reload.pending_account_deletion_request.scheduled_for.to_date
      expect(mail.to).to eq [reader.email]
      expect(mail[:to].display_names).to eq ['Jordan Real']
      expect(mail.subject).to eq 'Your Gala account is closed'
      expect(mail.text_part.body.to_s).to include 'Hi Jordan Real,'
      expect(mail.text_part.body.to_s).to include I18n.l(date, format: :long)
      expect(mail.html_part.body.to_s).not_to include 'Deleted user'
    end

    it 'renders the email as HTML, escaping the reader\'s name' do
      reader.update! name: 'Jordan <b>Real</b>'

      post account_closure_path, params: { email: reader.email }

      html = ActionMailer::Base.deliveries.last.html_part.body.to_s
      expect(html).to include '<strong>Restore my account</strong>'
      expect(html).to include 'Hi Jordan &lt;b&gt;Real&lt;/b&gt;,'
      expect(html).not_to include '**'
    end

    it 'can close again after restoring, with a fresh 30 days (W12)' do
      post account_closure_path, params: { email: reader.email }
      Readers::RestoreAccount.call(reader.reload)
      sign_in reader

      post account_closure_path, params: { email: reader.email }

      expect(reader.reload).to be_closed
      expect(reader.account_deletion_requests.count).to eq 2
    end
  end

  it 'keeps a closed reader on the restore page' do
    Readers::CloseAccount.call(reader)
    sign_in reader

    get new_account_closure_path

    expect(response).to redirect_to account_restoration_path
  end

  describe 'support restoring an account (W10)' do
    let(:admin) { create :reader, :editor }

    before do
      Readers::CloseAccount.call(reader)
      sign_in admin
    end

    it 'shows the deletion date and a restore button' do
      get "/admin/readers/#{reader.id}"

      date = reader.reload.pending_account_deletion_request.scheduled_for.to_date
      expect(response.body).to include "Will be deleted on #{I18n.l(date, format: :long)}"
      expect(response.body).to include restore_admin_reader_path(reader)
    end

    it 'restores the account' do
      post restore_admin_reader_path(reader)

      expect(response).to redirect_to admin_reader_path(reader)
      expect(reader.reload).not_to be_closed
      expect(reader.name).to eq 'Jordan Real'
    end

    it 'shows no restore button for an open account' do
      open_reader = create :reader

      get "/admin/readers/#{open_reader.id}"

      expect(response.body).not_to include restore_admin_reader_path(open_reader)
    end

    it 'says so when there is nothing to restore' do
      open_reader = create :reader

      post restore_admin_reader_path(open_reader)

      expect(flash[:alert]).to eq I18n.t('admin.readers.restore.not_restorable')
    end

    it 'is for site admins only' do
      sign_in create(:reader)

      post restore_admin_reader_path(reader)

      expect(reader.reload).to be_closed
    end
  end
end
