# frozen_string_literal: true

require 'rails_helper'

# Register O8: take the person's name out of a reply by someone else, keep the
# rest of that person's words, and leave no trace in the forum.
RSpec.describe Readers::RemoveNameFromReply do
  let(:reader) { create :reader, name: 'Ada Lovelace' }
  let(:thread) { create :comment_thread, reader: reader }

  before { create :comment, comment_thread: thread, reader: reader, content: 'Opening thought.' }

  def reply(content)
    create :comment, comment_thread: thread, content: content
  end

  it 'replaces the name in every language the reply was stored in, in that language' do
    I18n.backend.store_translations(:fr, readers: { deleted_name: 'Utilisateur supprimé' })
    named = reply 'Thanks'
    named.update_columns(content: { 'en' => "Thanks Ada.\n\nLovelace is right, unlike the Adams family.",
                                    'fr' => 'Merci ada !' })

    described_class.call(reader, named.id)

    expect(named.reload.read_attribute(:content)).to eq(
      'en' => "Thanks [Deleted user].\n\n[Deleted user] is right, unlike the Adams family.",
      'fr' => 'Merci [Utilisateur supprimé] !'
    )
  ensure
    I18n.reload!
  end

  it 'leaves no trace: not marked edited, and the thread is not lifted' do
    named = reply 'Thanks Ada.'
    named.update_columns(updated_at: 2.days.ago)
    thread.update_columns(updated_at: 2.days.ago)
    before = [named.reload.updated_at, thread.reload.updated_at]

    described_class.call(reader, named.id)

    expect([named.reload.updated_at, thread.reload.updated_at]).to eq before
    expect(named).not_to be_edited
  end

  it 'refuses a reply that does not name them' do
    other = reply 'Nothing about anyone.'

    expect { described_class.call(reader, other.id) }.to raise_error described_class::NotAMention
    expect(other.reload.content).to eq 'Nothing about anyone.'
  end

  it 'refuses their own comment, and a reply in a thread they never wrote in' do
    own = create :comment, comment_thread: thread, reader: reader, content: 'I, Ada, agree.'
    elsewhere = create :comment, content: 'Thanks Ada.'

    expect { described_class.call(reader, own.id) }.to raise_error described_class::NotAMention
    expect { described_class.call(reader, elsewhere.id) }.to raise_error described_class::NotAMention
    expect(elsewhere.reload.content).to eq 'Thanks Ada.'
  end

  it 'refuses once day 30 has scrubbed the name, rather than matching everything' do
    named = reply 'Thanks Ada.'
    Readers::CloseAccount.call(reader)
    Readers::AnonymizeAccount.call(reader)

    expect { described_class.call(reader.reload, named.id) }.to raise_error described_class::NotAMention
    expect(named.reload.content).to eq 'Thanks Ada.'
  end
end
