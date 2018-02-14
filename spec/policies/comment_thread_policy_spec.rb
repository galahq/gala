# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommentThreadPolicy do
  let(:reader) { build :reader }
  let(:editor) { build :reader, :editor }

  let(:thread) { build :comment_thread }
  let(:thread_with_comments) do
    build(:comment_thread).tap do |t|
      t.comments << build(:comment, comment_thread: t)
    end
  end

  subject { described_class }

  permissions :destroy? do
    it 'denies a reader access to delete someone else’s comment thread' do
      expect(subject).not_to permit reader, thread
    end

    it 'denies a reader access to delete her own comment thread ' \
       'if it still has comments' do
      thread_with_comments.reader = reader
      expect(subject).not_to permit reader, thread_with_comments
    end

    it 'allows a reader to delete her own comment thread if it is empty' do
      thread.reader = reader
      expect(subject).to permit reader, thread
    end

    it 'denies an editor access to delete a thread that has comments' do
      expect(subject).not_to permit editor, thread_with_comments
    end

    it 'allows an editor to delete anyone’s empty comment threads' do
      expect(subject).to permit editor, thread
    end
  end
end
