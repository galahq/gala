# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommentThread, type: :model do
  context '#key' do
    it 'is unguessable' do
      thread = build_stubbed :comment_thread

      expect(thread.key).to match(/\h{8}-\h{4}-\h{4}-\h{4}-\h{12}/)
    end

    it 'is unique' do
      thread1 = build_stubbed :comment_thread
      thread2 = build_stubbed :comment_thread

      expect(thread1.key).not_to eq thread2.key
    end
  end
end
