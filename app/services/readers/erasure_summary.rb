# frozen_string_literal: true

module Readers
  # What {EraseAccount} would remove from a closed account, counted for the
  # admin confirmation page. Ed can quote it in the reply to the person
  # (Tier 2 erasure checklist, step 8). The counts use the same rules as the
  # erasure itself; a spec checks they match what it actually deletes.
  class ErasureSummary
    # In the order the admin pages list them. Saved by name on the deletion
    # request (+erasure_counts+), so renaming one orphans old records.
    COUNTS = %i[comments_deleted comments_blanked quiz_answers quiz_submissions
                reading_lists_deleted reading_lists_kept visits events].freeze

    attr_reader(*COUNTS)

    def initialize(reader)
      @reader = reader
      count_comments
      count_quiz_work
      count_reading_lists
      count_activity
    end

    # @return [Hash{String => Integer}] every count, keyed by name
    def to_h
      COUNTS.to_h { |count| [count.to_s, public_send(count)] }
    end

    private

    def count_comments
      comments = @reader.comments.unscope(:order).includes(:comment_thread).to_a
      @comments_blanked = comments.count { |comment| EraseAccount.opens_a_conversation?(comment, @reader) }
      @comments_deleted = comments.size - @comments_blanked
    end

    def count_quiz_work
      submissions = Submission.where(reader_id: @reader.id)
      @quiz_submissions = submissions.count
      @quiz_answers = Answer.where(reader_id: @reader.id).or(Answer.where(submission_id: submissions.select(:id))).count
    end

    def count_reading_lists
      lists = @reader.reading_lists.includes(:reading_list_saves).to_a
      @reading_lists_kept = lists.count { |list| list.reading_list_saves.any? { |save| save.reader_id != @reader.id } }
      @reading_lists_deleted = lists.size - @reading_lists_kept
    end

    def count_activity
      visits = Visit.where(user_id: @reader.id)
      @visits = visits.count
      @events = Ahoy::Event.where(user_id: @reader.id)
                           .or(Ahoy::Event.where(user_id: nil, visit_id: visits.select(:id)))
                           .count
    end
  end
end
