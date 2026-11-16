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

    expect(described_class.new(reader).total).to eq 0
  end

  it 'ignores the person’s own comments and threads they never wrote in' do
    reply 'Ada wrote this about herself.', by: reader
    reply 'Ada is mentioned elsewhere.', on: create(:comment_thread)

    expect(described_class.new(reader).total).to eq 0
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
    expect(mentions.total).to eq 0
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

    expect(mentions).not_to be_searchable
    expect(mentions.comments).to be_empty
    expect(mentions.total).to eq 0
  end

  it 'searches by the words in a name, ignoring its punctuation' do
    reader.update_columns(name: 'Ann (Annie) O.Brien')
    reply 'Annie, thanks.'
    reply 'OxBrien'

    expect(described_class.new(reader).total).to eq 1
  end
end
