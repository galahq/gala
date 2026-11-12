# frozen_string_literal: true

module Readers
  # Which rows belong to a reader, for the records whose ownership takes more
  # than a `reader_id` match. {ErasureSummary}, {EraseAccount} and
  # {ExportAccount} all ask here, so what the erasure removes, what its
  # confirmation page counts and what the person can download can't drift
  # apart.
  class AccountRecords
    def initialize(reader)
      @reader = reader
    end

    # Default scope off: the export and the erasure both need every comment,
    # whatever the default scope hides.
    def comments
      Comment.unscoped.where(reader_id: @reader.id)
    end

    def submissions
      Submission.where(reader_id: @reader.id)
    end

    # Answers in their submissions are theirs too, whoever the row names.
    def answers
      Answer.where(reader_id: @reader.id).or(Answer.where(submission_id: submissions.select(:id)))
    end

    def visits
      Visit.where(user_id: @reader.id)
    end

    # Their events, and the anonymous events on their visits (before they
    # signed in). Another person's events on a shared visit are not theirs.
    def events
      Ahoy::Event.where(user_id: @reader.id)
                 .or(Ahoy::Event.where(user_id: nil, visit_id: visits.select(:id)))
    end
  end
end
