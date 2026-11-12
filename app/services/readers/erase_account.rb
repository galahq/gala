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
      @records = AccountRecords.new(reader)
      @blobs_to_purge = []
    end

    # @return [Reader] the erased reader
    def call
      @reader.with_lock do
        # with_lock reloads, so this sees a restore done elsewhere.
        raise NotClosed, "reader #{@reader.id} is not closed" unless @reader.closed?

        erase
      end
      # Only once the erasure has committed: a rolled-back erasure keeps its
      # files.
      ActiveRecord.after_all_transactions_commit { @blobs_to_purge.each(&:purge_later) }
      @reader.reload
    end

    private

    # Counted first, under the lock, so the record says what this erasure
    # removed: the same counts the admin confirmation page shows.
    def erase
      counts = ErasureSummary.new(@reader).to_h
      AnonymizeAccount.call(@reader, now: @now) unless @reader.anonymized?
      erase_comments
      erase_quiz_answers
      erase_reading_lists
      erase_activity
      clear_leftover_details
      record_erasure counts
    end

    def erase_comments
      remove_attachments ActiveStorage::Attachment.where(record_type: 'Comment',
                                                         record_id: @records.comments.select(:id))
      EraseComments.new(@reader).call
    end

    # Answers before submissions: answers.submission_id has a foreign key.
    def erase_quiz_answers
      @records.answers.delete_all
      @records.submissions.delete_all
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
      remove_attachments ActiveStorage::Attachment.where(record: list, name: 'social_image')
    end

    # The attachment rows go with the erasure, the files once it has
    # committed. Not Attachment#purge_later: that touches the record the file
    # was on, marking a blanked comment "(edited)" and lifting its thread.
    def remove_attachments(attachments)
      @blobs_to_purge.concat ActiveStorage::Blob.where(id: attachments.select(:blob_id)).to_a
      attachments.delete_all
    end

    # Events first: they point at the visits. Another person's events on a
    # shared visit stay (see {AccountRecords#events}).
    def erase_activity
      @records.events.delete_all
      @records.visits.delete_all
    end

    def clear_leftover_details
      @reader.update_columns(Reader.column_defaults.slice(*LEFTOVER_COLUMNS).merge('updated_at' => @now))
    end

    # Every closed account has a request from CloseAccount; the latest is the
    # one this erasure answers. A second run keeps the first run's record,
    # counts included: a re-run finds little or nothing left.
    def record_erasure(counts)
      request = @reader.account_deletion_requests.order(requested_at: :desc).first!
      request.update!(erased_at: @now, erased_by_id: @erased_by.id, erasure_counts: counts) unless request.erased_at
    end
  end
end
