# frozen_string_literal: true

module Readers
  # Replies by other people, in threads the person took part in, that name
  # them. The erasure removes what the person wrote, not what others wrote
  # about them (erasure checklist, step 5), so the confirmation page lists
  # these for the admin to look over before erasing. Afterwards the person's
  # comments are gone and these threads can no longer be found from them.
  #
  # Matches the stored name, whole and word by word, as whole words in any
  # language the reply was stored in. A name's words are its runs of letters,
  # so "O'Brien" also finds "Brien" and "Mary-Jane" finds "Mary". Words shorter
  # than three letters are skipped: initials would match nearly everything. A name can't find a
  # nickname or a quote, so this narrows the reading down; it doesn't replace
  # it. Once day 30 has scrubbed the account there is no name to search for.
  class ErasureMentions
    LIMIT = 100
    MIN_PART_LENGTH = 3

    def initialize(reader)
      @reader = reader
    end

    # @return [Boolean] false once the name has been scrubbed
    def searchable?
      terms.any?
    end

    # @return [Integer] how many threads the person wrote in
    def threads_checked
      @threads_checked ||= own_comments.distinct.count(:comment_thread_id)
    end

    # @return [Array<Comment>] at most {LIMIT}, oldest first, with their
    #   thread, case and author loaded
    def comments
      return [] unless searchable?

      @comments ||= mentioning.includes(:reader, comment_thread: %i[case community])
                              .order(:created_at, :id).limit(LIMIT).to_a
    end

    # @return [Integer] how many there are in all, beyond the {LIMIT} shown
    def total
      return 0 unless searchable?

      @total ||= mentioning.count
    end

    private

    def own_comments
      Comment.unscoped.where(reader_id: @reader.id)
    end

    # NULL reader ids count as someone else, as in {EraseComments}.
    def mentioning
      Comment.unscoped
             .where(comment_thread_id: own_comments.select(:comment_thread_id))
             .where('comments.reader_id IS DISTINCT FROM ?', @reader.id)
             .where('comments.content::text ~* ?', pattern)
    end

    # PostgreSQL's \m and \M are the start and end of a word.
    def pattern
      "\\m(#{terms.map { |term| Regexp.escape(term) }.join('|')})\\M"
    end

    def terms
      @terms ||= begin
        name = @reader.stored_name.to_s.squish
        if @reader.anonymized? || name.blank?
          []
        else
          parts = name.scan(/[[:alpha:]]+/).select { |part| part.length >= MIN_PART_LENGTH }
          [name, *parts].uniq
        end
      end
    end
  end
end
