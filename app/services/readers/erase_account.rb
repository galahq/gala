# frozen_string_literal: true

module Readers
  # Tier 2: full erasure, the Art. 17 response (register A14; Tier 2 erasure
  # checklist, step 5). A site admin runs it for a closed account once the
  # person has confirmed the request from the address on the account.
  #
  # Tier 1 hides the person and, at day 30, scrubs their identity, but keeps
  # what they contributed under "Deleted user". This removes the
  # contributions too:
  #
  # 1. the day-30 scrub ({AnonymizeAccount}), now, if it hasn't happened yet;
  # 2. their comments and the files on them. The opening comment of a thread
  #    someone else replied to is blanked instead, so the replies stay (O3);
  # 3. their quiz answers and submissions, whatever the B1 switch says (O7);
  # 4. their reading lists nobody else saved. Lists others saved keep their
  #    cases, but lose the title, description and notes the person wrote (O4);
  # 5. their visits and events (O5);
  # 6. the account details the day-30 scrub leaves behind (O6);
  # 7. a record on the deletion request: when, and which admin.
  #
  # Kept on purpose: the "Deleted user" row itself, so every foreign key and
  # the record of the erasure survive (O6); quizzes they wrote, which stay
  # private on the row (see {AnonymizeAccount}); bylines on cases (A16).
  #
  # Safe to run again. Checklist step 7 re-runs every erasure after a backup
  # is restored, and a second press of the button must finish cleanly.
  #
  # Runs under the reader's row lock, shared with {CloseAccount},
  # {RestoreAccount} and {AnonymizeAccount}.
  class EraseAccount
    class NotClosed < StandardError; end

    # Left behind by the day-30 scrub. Reset to what a new row holds, so
    # nothing about how the person used Gala remains.
    LEFTOVER_COLUMNS = %w[
      sign_in_count current_sign_in_at last_sign_in_at confirmed_at persona
      locale seen_announcements_created_before terms_of_service
      created_password
    ].freeze

    def self.call(reader, erased_by:, now: Time.current)
      new(reader, erased_by: erased_by, now: now).call
    end

    def initialize(reader, erased_by:, now: Time.current)
      @reader = reader
      @erased_by = erased_by
      @now = now
      @attachments_to_purge = []
    end

    # @return [Reader] the erased reader
    def call
      @reader.with_lock do
        # with_lock reloads, so this sees a restore done elsewhere.
        raise NotClosed, "reader #{@reader.id} is not closed" unless @reader.closed?

        erase
      end
      # Only once the erasure has committed: a rolled-back erasure keeps its
      # files. Destroyed records purge their own attachments after commit.
      ActiveRecord.after_all_transactions_commit { @attachments_to_purge.each(&:purge_later) }
      @reader.reload
    end

    private

    def erase
      AnonymizeAccount.call(@reader, now: @now) unless @reader.anonymized?
      erase_comments
      erase_quiz_answers
      erase_reading_lists
      erase_activity
      clear_leftover_details
      record_erasure
    end

    # Without touching anything: the forum lists threads by updated_at, so a
    # touch would lift every thread the person ever posted in to the top of
    # "most recent", drawing attention to exactly those threads. Removing what
    # someone wrote is not new activity. The touch chain runs comment ->
    # thread -> forum and card -> page. no_touching stops all of it except
    # the comment counter: Rails stamps the thread's updated_at in the same
    # SQL that decrements comments_count, so those times are put back after.
    def erase_comments
      times = CommentThread.unscoped.where(id: @reader.comments.select(:comment_thread_id)).pluck(:id, :updated_at)
      ActiveRecord::Base.no_touching do
        @reader.comments.unscope(:order).includes(:comment_thread).find_each { |comment| erase_comment comment }
        remove_empty_threads
      end
      times.each { |id, at| CommentThread.unscoped.where(id: id).update_all(updated_at: at) }
    end

    def erase_comment(comment)
      return blank(comment) if opens_a_conversation?(comment)

      ReplyNotification.where(comment_id: comment.id).delete_all
      comment.destroy!
    end

    # The first comment of a thread anyone else has replied to. NULL reader
    # ids count as someone else: they are replies whose author was removed
    # before closure existed (#798).
    def opens_a_conversation?(comment)
      thread = comment.comment_thread
      thread.comments.first == comment &&
        thread.comments.unscope(:order).where('reader_id IS DISTINCT FROM ?', @reader.id).exists?
    end

    # Replaces the text in every language it was stored in. update_columns
    # leaves updated_at alone, so the comment isn't shown as "(edited)".
    def blank(comment)
      locales = comment.read_attribute(:content).keys.presence || [I18n.default_locale.to_s]
      english = I18n.t('comments.erased', locale: :en)
      erased = locales.index_with { |locale| I18n.t('comments.erased', locale: locale, default: english) }
      comment.update_columns(content: erased)
      @attachments_to_purge << comment.attachments if comment.attachments.attached?
    end

    # Threads the person started that now have no comments at all. A thread
    # someone else started stays theirs, even if it is now empty. Checked
    # against comments, not comments_count, which is NULL on old threads.
    def remove_empty_threads
      CommentThread.unscope(:order).where(reader_id: @reader.id)
                   .where('NOT EXISTS (SELECT 1 FROM comments WHERE comments.comment_thread_id = comment_threads.id)')
                   .find_each do |thread|
        ReplyNotification.where(comment_thread_id: thread.id).delete_all
        thread.destroy!
      end
    end

    # Answers before submissions: answers.submission_id has a foreign key.
    # Answers in their submissions are theirs too, whoever the row names.
    def erase_quiz_answers
      submissions = Submission.where(reader_id: @reader.id)
      Answer.where(reader_id: @reader.id).or(Answer.where(submission_id: submissions.select(:id))).delete_all
      submissions.delete_all
    end

    def erase_reading_lists
      @reader.reading_lists.includes(:reading_list_saves).find_each do |list|
        if list.reading_list_saves.any? { |save| save.reader_id != @reader.id }
          keep_for_others list
        else
          list.destroy!
        end
      end
    end

    # update_columns: ReadingList's after_save would save the list back into
    # the erased reader's library.
    def keep_for_others(list)
      list.update_columns(title: I18n.t('reading_lists.erased_title', locale: :en), description: '', updated_at: @now)
      list.reading_list_items.update_all(notes: '', updated_at: @now)
      @attachments_to_purge << list.social_image if list.social_image.attached?
    end

    # Their visits, their events, and the anonymous events on their visits
    # (before they signed in). Another person's events on a shared visit stay.
    def erase_activity
      visits = Visit.where(user_id: @reader.id)
      Ahoy::Event.where(user_id: @reader.id)
                 .or(Ahoy::Event.where(user_id: nil, visit_id: visits.select(:id)))
                 .delete_all
      visits.delete_all
    end

    def clear_leftover_details
      defaults = Reader.column_defaults.slice(*LEFTOVER_COLUMNS)
      @reader.update_columns(defaults.merge('updated_at' => @now))
    end

    # Every closed account has a request from CloseAccount; the latest is the
    # one this erasure answers. A second run keeps the first run's record.
    def record_erasure
      request = @reader.account_deletion_requests.order(requested_at: :desc).first!
      request.update!(erased_at: request.erased_at || @now, erased_by_id: request.erased_by_id || @erased_by.id)
    end
  end
end
