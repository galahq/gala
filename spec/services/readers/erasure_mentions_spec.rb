# frozen_string_literal: true

require 'rails_helper'

# The erasure removes what the person wrote, not what others wrote about them
# (erasure checklist, step 5). The confirmation page lists the replies that
# name them, because once erased their threads can't be found from them.
RSpec.describe Readers::ErasureMentions do
  let(:reader) { create :reader, name: 'Ada Lovelace' }
  let(:other) { create :reader }
  let(:thread) { create :comment_thread }

  before do
    create :comment, comment_thread: thread, reader: reader, content: 'My first thought.'
  end

  def reply(content, by: other, on: thread)
    create :comment, comment_thread: on, reader: by, content: content
  end

  it 'finds replies by others that use their full name or part of it' do
    full = reply 'I agree with Ada Lovelace here.'
    first = reply 'ada, good point'
    last = reply 'As Lovelace said.'
    reply 'Nothing about anyone.'

    expect(described_class.new(reader).comments).to eq [full, first, last]
  end

  it 'matches whole words only' do
    reply 'The Adams family and adamant objections.'

    expect(described_class.new(reader).comments).to be_empty
  end

  it 'ignores the person’s own comments and threads they never wrote in' do
    reply 'Ada wrote this about herself.', by: reader
    reply 'Ada is mentioned elsewhere.', on: create(:comment_thread)

    expect(described_class.new(reader).comments).to be_empty
  end

  it 'counts a reply whose author was removed as someone else’s' do
    orphan = reply 'Thanks Ada.'
    orphan.update_columns(reader_id: nil)

    expect(described_class.new(reader).comments).to eq [orphan]
  end

  it 'searches every language a reply was stored in' do
    translated = reply 'Merci'
    translated.update_columns(content: { 'en' => 'Thanks', 'fr' => 'Merci Ada' })

    expect(described_class.new(reader).comments).to eq [translated]
  end

  it 'skips name parts too short to mean anything' do
    reader.update_columns(name: 'Jo Ng')
    reply 'Jo, see Ng above.'

    mentions = described_class.new(reader)

    expect(mentions).to be_searchable
    expect(mentions.comments).to be_empty
  end

  it 'reports how many threads it looked in' do
    create :comment, reader: reader

    expect(described_class.new(reader).threads_checked).to eq 2
  end

  it 'has nothing to search for once day 30 has scrubbed the name' do
    reply 'Thanks Ada.'
    Readers::CloseAccount.call(reader)
    Readers::AnonymizeAccount.call(reader)

    mentions = described_class.new(reader.reload)

    expect(mentions).to be_scrubbed
    expect(mentions).not_to be_searchable
    expect(mentions.comments).to be_empty
  end

  it 'searches by the words in a name, ignoring its punctuation' do
    reader.update_columns(name: 'Ann (Annie) O.Brien')
    reply 'Annie, thanks.'
    reply 'OxBrien'

    expect(described_class.new(reader).comments.size).to eq 1
  end

  it 'finds a name that starts a new line' do
    paragraph = reply "Good point.\n\nAda, I disagree with the second part."

    expect(described_class.new(reader).comments).to eq [paragraph]
  end

  it 'shows the translation that names them, not the admin’s language' do
    translated = reply 'Thanks'
    translated.update_columns(content: { 'en' => 'Thanks', 'fr' => 'Merci Ada' })

    expect(described_class.new(reader).matching_texts(translated)).to eq ['Merci Ada']
  end

  it 'finds a name written without spaces around it' do
    reader.update_columns(name: '王小明')
    chinese = reply '我同意王小明的观点'

    expect(described_class.new(reader).comments).to eq [chinese]
  end

  it 'skips a whole name too short to mean anything' do
    reader.update_columns(name: 'Al')
    reply 'Al, al dente.'

    mentions = described_class.new(reader)

    expect(mentions).not_to be_scrubbed
    expect(mentions).not_to be_searchable
    expect(mentions.comments).to be_empty
  end

  it 'searches a thread they started even when none of their comments is left in it' do
    started = create :comment_thread, reader: reader
    named = reply 'Ada asked a good question.', on: started

    mentions = described_class.new(reader)

    expect(mentions.comments).to include named
    expect(mentions.threads_checked).to eq 2
  end

  it 'shows at most the limit, and says there are more' do
    stub_const "#{described_class}::LIMIT", 2
    3.times { reply 'Thanks Ada.' }

    mentions = described_class.new(reader)

    expect(mentions.comments.size).to eq 2
    expect(mentions).to be_more
  end
end
