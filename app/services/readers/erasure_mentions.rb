# frozen_string_literal: true

module Readers
  # Replies by other people, in threads the person took part in, that name
  # them. The erasure removes what the person wrote, not what others wrote
  # about them (erasure checklist, step 5), so the confirmation page lists
  # these for the admin to look over before erasing. Afterwards the person's
  # comments are gone and these threads can no longer be found from them.
  #
  # Matches the stored name, whole and word by word, in every language a reply
  # was stored in. A name's words are its runs of letters, so "O'Brien" also
  # finds "Brien" and "Mary-Jane" finds "Mary". Words shorter than three
  # letters (two in Chinese, Japanese or Korean) are skipped: initials would
  # match nearly everything. Words are matched whole, except in scripts
  # written without spaces, where a name sits between other letters. A name
  # can't find a nickname or a quote, so this narrows the reading down; it
  # doesn't replace it. Once day 30 has scrubbed the account there is no name
  # to search for.
  class ErasureMentions
    LIMIT = 100
    MIN_LENGTH = 3
    MIN_UNSPACED_LENGTH = 2
    UNSPACED = /\p{Han}|\p{Hiragana}|\p{Katakana}|\p{Hangul}/

    def initialize(reader)
      @reader = reader
    end

    # @return [Boolean] true once day 30 or an erasure has removed the name
    def scrubbed?
      @reader.anonymized? || @reader.stored_name.blank?
    end

    # @return [Boolean] false once the name is scrubbed, or if every word of
    #   it is too short to search for
    def searchable?
      terms.any?
    end

    # @return [Integer] how many threads the person wrote in or started
    def threads_checked
      @threads_checked ||= CommentThread.unscoped.where(id: written_in).or(started).count
    end

    # @return [Array<Comment>] at most {LIMIT}, oldest first, with their
    #   thread, case and author loaded
    def comments
      fetched.first(LIMIT)
    end

    # @return [Boolean] whether there are more than the {LIMIT} shown
    def more?
      fetched.size > LIMIT
    end

    # One of the listed replies, for {RemoveNameFromReply}.
    # @return [Comment, nil] nil unless it is a reply this lists
    def find(comment_id)
      return unless searchable?

      mentioning.find_by(id: comment_id)
    end

    # The translations of a reply that name the person, so the page shows
    # the text that matched rather than the admin's own language.
    # @return [Array<String>]
    def matching_texts(comment)
      stored = comment.read_attribute(:content)
      texts = stored.is_a?(Hash) ? stored.values : [stored]
      texts.map(&:to_s).grep(ruby_pattern)
    end

    # @return [Regexp] the same match, for highlighting it on the page
    def ruby_pattern
      @ruby_pattern ||= Regexp.union(terms.map do |term|
        escaped = Regexp.escape(term)
        unspaced?(term) ? /#{escaped}/i : /(?<![[:alnum:]_])#{escaped}(?![[:alnum:]_])/i
      end)
    end

    private

    def fetched
      return [] unless searchable?

      @fetched ||= mentioning.includes(:reader, comment_thread: %i[case community])
                             .order(:created_at, :id).limit(LIMIT + 1).to_a
    end

    def started
      CommentThread.unscoped.where(reader_id: @reader.id)
    end

    def written_in
      Comment.unscoped.where(reader_id: @reader.id).select(:comment_thread_id)
    end

    # Threads they wrote in, and threads they started even if none of their
    # own comments is left in them.
    def in_their_threads
      Comment.unscoped.where(comment_thread_id: written_in)
             .or(Comment.unscoped.where(comment_thread_id: started.select(:id)))
    end

    # Each stored translation is matched on its own text: the jsonb as a
    # whole is JSON, where a line break is "\n" and would hide a name that
    # starts a paragraph. NULL reader ids count as someone else, as in
    # {EraseComments}.
    def mentioning
      in_their_threads
        .where('comments.reader_id IS DISTINCT FROM ?', @reader.id)
        .where(<<~SQL.squish, pattern: sql_pattern)
          CASE jsonb_typeof(comments.content)
            WHEN 'object' THEN EXISTS (SELECT 1 FROM jsonb_each_text(comments.content) AS translation
                                       WHERE translation.value ~* :pattern)
            WHEN 'string' THEN comments.content #>> '{}' ~* :pattern
            ELSE false
          END
        SQL
    end

    # PostgreSQL's \m and \M are the start and end of a word.
    def sql_pattern
      terms.map do |term|
        escaped = Regexp.escape(term)
        unspaced?(term) ? escaped : "\\m#{escaped}\\M"
      end.join('|')
    end

    def unspaced?(term)
      term.match?(UNSPACED)
    end

    def terms
      @terms ||= scrubbed? ? [] : name_terms
    end

    def name_terms
      name = @reader.stored_name.squish
      [name, *name.scan(/[[:alpha:]]+/)].uniq.select do |term|
        term.length >= (unspaced?(term) ? MIN_UNSPACED_LENGTH : MIN_LENGTH)
      end
    end
  end
end
