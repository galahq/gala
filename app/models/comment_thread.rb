# frozen_string_literal: true

# A comment and its replies. The first comment in a thread is displayed as a
# “post,” with more room for detail.
#
# @attr original_highlight_text [String] the string of text from the thread’s
#   {Card} to which it is attached. The first of any duplicate matches will be
#   used, so it is intended to be a unique string within the card.
# @attr locale [Iso639_1Code] which translation of the case this comment thread
#   is attached to.
class CommentThread < ApplicationRecord
  belongs_to :card, touch: true, optional: true
  belongs_to :forum, touch: true
  belongs_to :reader

  has_many :comments, dependent: :destroy
  has_many :collocutors, -> { unscope(:order).distinct },
           through: :comments, source: :reader

  has_one :case, through: :forum
  has_one :community, through: :forum

  # The comment threads that are visible to a given reader
  # @return [ActiveRecord::Relation<CommentThread>]
  def self.visible_to_reader(reader)
    where(
      'comment_threads.comments_count > 0 OR comment_threads.reader_id = ?',
      reader.id
    )
  end

  # The reader participants in this comment thread, ordered by their first
  # comment in this thread
  # @return [Array<Reader>]
  def collocutors
    comments.map(&:reader).uniq
  end
end
