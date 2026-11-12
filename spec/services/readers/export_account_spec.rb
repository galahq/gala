# frozen_string_literal: true

require 'rails_helper'

# The copy a reader downloads from the Your data page (register 9b).
RSpec.describe Readers::ExportAccount do
  let(:reader) { create :reader, name: 'Jordan Real', email: 'jordan@example.com' }
  let(:other) { create :reader, name: 'Sam Other', email: 'sam@example.com' }

  def export(of = reader, **)
    JSON.parse(described_class.new(of, **).each.to_a.join)
  end

  it 'is one JSON object with every section, in order' do
    expect(export.keys).to eq described_class::SECTIONS.map(&:to_s)
  end

  it 'opens with why the data is held, who receives it, how long it is kept and a glossary' do
    about = export['about']

    expect(about).to include('account_id' => reader.id)
    expect(about['why_we_hold_it']).to be_present
    expect(about['who_else_receives_it']).to be_present
    expect(about['how_long_we_keep_it']).to be_present
    expect(about['your_rights']).to include ApplicationMailer::FROM_ADDRESS
    expect(about['your_rights']).to include 'limit'
    expect(about['why_we_hold_it']['activity']['what']).to include 'approximate location'
    expect(about['glossary'].keys).to eq described_class::SECTIONS.map(&:to_s)
  end

  it 'explains why every list is held' do
    expect(described_class::PURPOSES.values.flatten).to match_array described_class::LISTS
    expect(export['about']['why_we_hold_it'].keys).to eq described_class::PURPOSES.keys.map(&:to_s)
  end

  it 'writes every time the same way, in UTC' do
    list = create :reading_list, reader: reader
    create :reading_list_item, reading_list: list
    create :ahoy_event, user: reader, visit: create(:visit, user: reader)
    utc = /\A\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z\z/
    data = export

    times = [data['about']['generated_at'], data['account']['created_at'], data['visits'].sole['started_at'],
             data['events'].sole['time'], data['reading_lists'].sole['created_at'],
             data['reading_lists'].sole['cases'].sole['added_at']]

    expect(times).to all(match(utc))
    expect(data['visits'].sole['started_at']).to eq Visit.last.started_at.utc.iso8601(6)
  end

  describe 'the account' do
    it 'holds the profile and sign-in details' do
      reader.update_columns(current_sign_in_ip: '203.0.113.7', sign_in_count: 4)

      expect(export['account']).to include('name' => 'Jordan Real', 'email' => 'jordan@example.com',
                                           'current_sign_in_ip' => '203.0.113.7', 'sign_in_count' => 4)
    end

    it 'leaves out the password hash and the tokens' do
      reader.update_columns(reset_password_token: 'reset-secret', confirmation_token: 'confirm-secret')

      text = described_class.new(reader).each.to_a.join

      expect(export['account'].keys).not_to include('encrypted_password', 'reset_password_token',
                                                    'confirmation_token', 'remember_created_at')
      expect(text).not_to include(reader.encrypted_password, 'reset-secret', 'confirm-secret')
    end

    it 'links the profile photo' do
      reader.image.attach(io: StringIO.new('photo'), filename: 'me.jpg', content_type: 'image/jpeg')

      photo = export(file_url: ->(file) { "https://files.example/#{file.filename}" })['account']['profile_photo']

      expect(photo).to include('name' => 'me.jpg', 'link' => 'https://files.example/me.jpg')
    end
  end

  describe 'comments' do
    it 'holds their comments and the text they highlighted, not replies by others' do
      thread = create :comment_thread, reader: reader, original_highlight_text: 'the quoted line'
      create :comment, comment_thread: thread, reader: reader, content: 'My opening'
      create :comment, comment_thread: thread, reader: other, content: 'A reply by someone else'

      comments = export['comments']

      expect(comments.size).to eq 1
      expect(comments.sole).to include('highlighted_text' => 'the quoted line', 'text' => { 'en' => 'My opening' })
      expect(comments.to_json).not_to include 'A reply by someone else'
    end

    it 'names the case through the forum, as the thread itself does' do
      comment = create :comment, reader: reader
      comment.comment_thread.update_columns(case_id: nil)

      expect(export['comments'].sole['case']).to eq comment.comment_thread.forum.case.slug
    end

    it 'links the files attached to them' do
      comment = create :comment, reader: reader
      comment.attachments.attach(io: StringIO.new('scan'), filename: 'notes.pdf', content_type: 'application/pdf')

      files = export(file_url: ->(file) { "https://files.example/#{file.filename}" })['comments'].sole['files']

      expect(files).to eq [{ 'name' => 'notes.pdf', 'type' => 'application/pdf', 'bytes' => 4,
                             'link' => 'https://files.example/notes.pdf' }]
    end
  end

  it 'holds their quiz answers with the question, but not its correct answer' do
    submission = create :submission, reader: reader
    question = create :question, quiz: submission.quiz, content: 'What is a watershed?', correct_answer: 'SECRET KEY'
    create :answer, reader: reader, submission: submission, quiz: submission.quiz, question: question,
                    content: 'A basin'

    data = export

    expect(data['quiz_submissions'].sole).to include('quiz_id' => submission.quiz_id)
    expect(data['quiz_answers'].sole).to include('question' => 'What is a watershed?', 'answer' => 'A basin')
    expect(data.to_json).not_to include 'SECRET KEY'
  end

  it 'holds their reading lists with the cases and their notes' do
    list = create :reading_list, reader: reader, title: 'Water week'
    create :reading_list_item, reading_list: list, notes: 'Start here'

    expect(export['reading_lists'].sole).to include('title' => 'Water week')
    expect(export['reading_lists'].sole['cases'].sole).to include('notes' => 'Start here')
  end

  it 'leaves out who replied to them' do
    create :reply_notification, reader: reader, comment: create(:comment, reader: other)

    notification = export['reply_notifications'].sole

    expect(notification.keys).not_to include('notifier_id')
    expect(notification.to_json).not_to include other.name
  end

  describe 'activity' do
    it 'holds their visits and events, and the anonymous events on their visits' do
      visit = create :visit, user: reader, city: 'Ann Arbor'
      create :ahoy_event, user: reader, visit: visit, name: 'read_card'
      create :ahoy_event, user: nil, visit: visit, name: 'read_overview'
      create :ahoy_event, user: other, visit: visit, name: 'not_theirs'
      create :ahoy_event, user: other, visit: create(:visit, user: other)

      data = export

      expect(data['visits'].sole).to include('id' => visit.id, 'city' => 'Ann Arbor')
      expect(data['visits'].sole.keys).not_to include 'user_id'
      expect(data['events'].pluck('name')).to contain_exactly('read_card', 'read_overview')
    end

    it 'is complete when written in many batches' do
      stub_const("#{described_class}::BATCH_SIZE", 2)
      visit = create :visit, user: reader
      events = create_list :ahoy_event, 5, user: reader, visit: visit

      expect(export['events'].pluck('id')).to eq events.map(&:id).sort
    end
  end

  it 'holds nothing of another reader' do
    create :comment, reader: other, content: 'Not Jordan’s'
    create :visit, user: other, city: 'Elsewhere'

    text = described_class.new(reader).each.to_a.join

    expect(text).not_to include('Not Jordan’s', 'Elsewhere', other.email)
  end

  # The export must hold everything the erasure removes: a category the
  # erasure learns about has to be added here too, or this fails.
  describe 'against the erasure' do
    let(:sections) do
      { comments_deleted: :comments, comments_blanked: :comments, quiz_answers: :quiz_answers,
        quiz_submissions: :quiz_submissions, reading_lists_deleted: :reading_lists,
        reading_lists_kept: :reading_lists, visits: :visits, events: :events }
    end

    before do
      opened = create :comment_thread, reader: reader
      create :comment, comment_thread: opened, reader: reader
      create :comment, comment_thread: opened, reader: other
      create :comment, reader: reader

      submission = create :submission, reader: reader
      create_list :answer, 2, reader: reader, submission: submission, quiz: submission.quiz
      create :answer, reader: other, submission: submission, quiz: submission.quiz

      create :reading_list, reader: reader
      create :reading_list_save, reader: other, reading_list: create(:reading_list, reader: reader)

      visit = create :visit, user: reader
      create :ahoy_event, user: reader, visit: visit
      create :ahoy_event, user: nil, visit: visit
    end

    it 'has a section for everything the erasure counts' do
      expect(sections.keys).to match_array Readers::ErasureSummary::COUNTS
    end

    it 'holds as many records as the erasure would remove' do
      summary = Readers::ErasureSummary.new(reader).to_h
      erased = sections.each_with_object(Hash.new(0)) { |(count, section), sums| sums[section] += summary[count.to_s] }
      data = export

      erased.each do |section, count|
        expect(data[section.to_s].size).to eq(count), "#{section}: #{data[section.to_s].size} exported, #{count} erased"
      end
    end

    it 'counts what the file holds' do
      counts = described_class.new(reader).counts
      data = export

      expect(counts).to eq(described_class::LISTS.index_with { |section| data[section.to_s].size })
    end
  end
end
