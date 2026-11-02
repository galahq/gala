# frozen_string_literal: true

module Readers
  # Tier 2, the comments step of {EraseAccount} (O3): deletes the person's
  # comments. The opening comment of a thread someone else replied to is
  # blanked instead, so the replies stay. {EraseAccount} removes the files
  # on them.
  #
  # In bulk: the heaviest reader has hundreds of comments (2 Nov), and the
  # erasure runs inside a web request. And without touching anything: the
  # forum lists threads by updated_at, so a touch would lift every thread the
  # person ever posted in to the top of "most recent", drawing attention to
  # exactly those threads. Removing what someone wrote is not new activity.
  # delete_all, update_all and update_columns run no touches and no counter
  # cache, so the threads' comment counts are set afterwards from what is left.
  class EraseComments
    # The person's comments that open a thread anyone else has replied to:
    # blanked, not deleted. NULL reader ids count as someone else: they are
    # replies whose author was removed before closure existed (#798). Shared
    # with {ErasureSummary}, so the confirmation page counts what this does.
    # @return [ActiveRecord::Relation<Comment>]
    def self.openings_to_blank(reader)
      threads = Comment.unscoped.where(reader_id: reader.id).select(:comment_thread_id)
      openings = Comment.unscoped.where(comment_thread_id: threads)
                        .select('DISTINCT ON (comment_thread_id) id')
                        .order(:comment_thread_id, :created_at, :id)
      Comment.unscoped.where(id: openings, reader_id: reader.id).where(<<~SQL.squish, reader.id)
        EXISTS (SELECT 1 FROM comments others
                WHERE others.comment_thread_id = comments.comment_thread_id
                  AND others.reader_id IS DISTINCT FROM ?)
      SQL
    end

    def initialize(reader)
      @reader = reader
      @comments = Comment.unscoped.where(reader_id: reader.id)
    end

    def call
      thread_ids = @comments.distinct.pluck(:comment_thread_id)
      openings = self.class.openings_to_blank(@reader).to_a
      openings.each { |comment| blank comment }
      delete @comments.where.not(id: openings.map(&:id))
      remove_empty_threads
      recount_comments thread_ids
    end

    private

    # Replaces the text in every language it was stored in. update_columns
    # leaves updated_at alone, so the comment isn't shown as "(edited)".
    def blank(comment)
      locales = comment.read_attribute(:content).to_h.keys.presence || [I18n.default_locale.to_s]
      english = I18n.t('comments.erased', locale: :en)
      erased = locales.index_with { |locale| I18n.t('comments.erased', locale: locale, default: english) }
      comment.update_columns(content: erased)
    end

    def delete(comments)
      ReplyNotification.where(comment_id: comments.select(:id)).delete_all
      comments.delete_all
    end

    # Threads the person started that now have no comments at all. A thread
    # someone else started stays theirs, even if it is now empty. Checked
    # against comments, not comments_count, which is NULL on a thread that
    # never had a comment.
    def remove_empty_threads
      empty = CommentThread.unscoped.where(reader_id: @reader.id).where(<<~SQL.squish).pluck(:id)
        NOT EXISTS (SELECT 1 FROM comments WHERE comments.comment_thread_id = comment_threads.id)
      SQL
      ReplyNotification.where(comment_thread_id: empty).delete_all
      CommentThread.unscoped.where(id: empty).delete_all
    end

    def recount_comments(thread_ids)
      CommentThread.unscoped.where(id: thread_ids).update_all(<<~SQL.squish)
        comments_count = (SELECT COUNT(*) FROM comments WHERE comments.comment_thread_id = comment_threads.id)
      SQL
    end
  end
end
