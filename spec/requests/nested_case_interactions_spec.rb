# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Nested case interactions' do
  let(:kase) { create :case_with_elements }
  let(:reader) { create :reader }
  let!(:enrollment) { create :enrollment, case: kase, reader: reader }
  let!(:forum) { create :forum, case: kase }

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
    sign_in reader
  end

  describe 'GET /cases/:case_slug/forums.json' do
    it 'returns forum JSON for an authorized reader' do
      get "/cases/#{kase.slug}/forums.json"

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        including(community: including(name: 'Global Community'))
      )
    end
  end

  describe 'POST /cards/:card_id/comment_threads.json' do
    let(:card) { kase.pages.first.cards.first }

    it 'creates a card comment thread as JSON' do
      post "/cards/#{card.id}/comment_threads.json",
           params: {
             comment_thread: {
               start: 0,
               length: 4,
               block_index: 0,
               original_highlight_text: card.raw_content.paragraphs.first.first(4)
             }
           }

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        cardId: card.id,
        readerId: reader.id,
        originalHighlightText: card.raw_content.paragraphs.first.first(4)
      )
    end

  end

  describe 'comment JSON mutations' do
    let(:comment_thread) do
      create :comment_thread, forum: forum, reader: reader
    end

    it 'creates a comment for a readable thread' do
      post "/comment_threads/#{comment_thread.id}/comments.json",
           params: { comment: { content: 'A nested route reply.' } }

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        content: including('A nested route reply.'),
        reader: including(id: reader.id),
        commentThreadId: comment_thread.id
      )
    end

    it 'returns 422 for invalid comment content' do
      post "/comment_threads/#{comment_thread.id}/comments.json",
           params: { comment: { content: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'updates the current reader comment as JSON' do
      comment = create :comment, comment_thread: comment_thread,
                                 reader: reader,
                                 content: 'Original reply'

      patch "/comments/#{comment.id}.json",
            params: { comment: { content: 'Updated reply' } }

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        content: including('Updated reply')
      )
    end

    it 'deletes a comment when the reader can moderate the forum' do
      reader.my_cases << kase
      comment = create :comment, comment_thread: comment_thread,
                                 content: 'Disposable reply'

      delete "/comments/#{comment.id}.json"

      expect(response).to have_http_status(:no_content)
      expect(Comment.exists?(comment.id)).to be false
    end
  end
end
