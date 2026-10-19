# frozen_string_literal: true

require 'rails_helper'

# The one spec the grace-state rules ask for: close a reader, then check every
# path that shows them to someone else. Closing hides who you are everywhere
# straight away and deletes nothing (rules W1 to W3, W6, W8 and W9). A new path
# that emits identity belongs here.
RSpec.describe 'What everyone else sees of a closed reader' do
  let(:closed) do
    create :reader, name: 'Real Name', initials: 'RN',
                    image_url: 'https://example.com/me.png'
  end
  let(:real_email) { closed.email }
  let(:real_hash_key) { Digest::SHA256.hexdigest(real_email) }
  let(:kase) { create :case, :published }

  def close!
    Readers::CloseAccount.call(closed)
    closed.reload
  end

  it 'shows a comment author as Deleted user, with a different identicon' do
    close!

    json = Readers::IdenticonSerializer.new(closed).as_json

    expect(json).to include(name: 'Deleted user', image_url: nil)
    expect(json[:hash_key]).not_to eq real_hash_key
    expect(json.to_s).not_to include('Real Name', real_email)
  end

  it 'keeps the closed identicon stable and distinct per account' do
    other = create :reader
    Readers::CloseAccount.call(other)
    close!

    expect(closed.hash_key).to eq Reader.find(closed.id).hash_key
    expect(closed.hash_key).not_to eq other.reload.hash_key
  end

  it 'hides initials and photo from the enrollment roster' do
    enrollment = create :enrollment, reader: closed, case: kase
    close!

    json = enrollment.reload.as_json
    expect(json['reader']).to include('name' => 'Deleted user',
                                      'initials' => nil, 'image_url' => nil)
  end

  # The roster JSON partial (readers/_reader.json.jbuilder) is rendered for
  # other people on the editors' roles page.
  it 'keeps the reader in reader lists, without email, initials or photo (W2, W8)' do
    group = create :group
    create :group_membership, group: group, reader: closed
    close!
    sign_in create(:reader, :editor)

    get readers_path(format: :json)

    entry = JSON.parse(response.body).find { |r| r['id'] == closed.id }
    expect(group.readers.reload).to include closed
    expect(entry).to include('name' => 'Deleted user', 'email' => nil,
                             'initials' => nil, 'imageUrl' => nil)
    expect(response.body).not_to include real_email
  end

  it 'leaves the email out of the submissions export (W3)' do
    instructor = create :reader
    group = create :group
    create :group_membership, reader: instructor, group: group, status: :admin
    deployment = create :deployment, :with_quiz, group: group, case: kase
    create :group_membership, reader: closed, group: group
    submission = create :submission, quiz: deployment.quiz, reader: closed
    create :answer, quiz: deployment.quiz, submission: submission,
                    reader: closed,
                    question: deployment.quiz.custom_questions.first
    close!
    sign_in instructor

    get deployment_submissions_path(deployment, format: :csv)

    expect(response.body).to include 'Deleted user'
    expect(response.body).not_to include real_email
    expect(response.body).not_to include 'Real Name'
  end

  it 'hides initials in the reply notification payload' do
    comment = create :comment, reader: closed
    notification = create :reply_notification, comment: comment
    close!

    payload = ApplicationController.render(notification.reload)

    expect(payload).to include 'Deleted user'
    expect(payload).not_to include '"RN"'
    expect(payload).not_to include 'Real Name'
  end

  describe 'notifications (W6)' do
    it 'does not notify a closed reader of a reply' do
      thread = create :comment_thread
      create :comment, comment_thread: thread, reader: closed
      close!

      # Notifications are sent from an after_create_commit callback. Reload
      # the thread as a request would: the first comment's callback cached its
      # comments, with a copy of the reader from before the account closed.
      create :comment, comment_thread: CommentThread.find(thread.id)

      expect(ReplyNotification.where(reader: closed)).to be_empty
    end

    it 'does not email a notification queued before the account closed' do
      notification = create :reply_notification, reader: closed
      close!

      mail = ReplyNotificationMailer.notify(notification.reload)

      expect(mail.message).to be_a ActionMailer::Base::NullMail
    end

    it 'does not email a closed library manager' do
      library = create :library
      create :managership, library: library, manager: closed
      request = CaseLibraryRequest.create!(case: kase, library: library,
                                           requester: create(:reader))
      close!

      mail = LibraryRequestMailer.notify(request, closed)

      expect(mail.message).to be_a ActionMailer::Base::NullMail
    end
  end

  describe 'live updates (W4)' do
    it 'refuses a closed reader a cable connection' do
      close!
      env = Rack::MockRequest.env_for('/cable')
      env['warden'] = instance_double(Warden::Proxy, user: closed)
      connection = ApplicationCable::Connection.new(ActionCable.server, env)

      expect { connection.connect }
        .to raise_error ActionCable::Connection::Authorization::UnauthorizedError
    end
  end

  describe 'site admins (W9)' do
    let(:admin) { create :reader, :editor }

    before do
      close!
      sign_in admin
    end

    it 'shows the stored name on the admin screen' do
      get "/admin/readers/#{closed.id}"

      expect(response.body).to include 'Real Name'
    end

    it 'does not let an admin save over a closed reader\'s identity' do
      patch "/admin/readers/#{closed.id}",
            params: { reader: { name: 'Deleted user', email: 'x@example.com',
                                locale: 'fr' } }

      closed.reload
      expect(closed.stored_name).to eq 'Real Name'
      expect(closed.email).to eq real_email
      expect(closed.locale).to eq 'fr'
    end

    it 'still lets an admin edit an open reader\'s identity' do
      open_reader = create :reader, name: 'Before'

      patch "/admin/readers/#{open_reader.id}",
            params: { reader: { name: 'After' } }

      expect(open_reader.reload.name).to eq 'After'
    end
  end
end
