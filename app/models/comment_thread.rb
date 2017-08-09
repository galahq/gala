# frozen_string_literal: true

class CommentThread < ApplicationRecord
  include Authority::Abilities

  belongs_to :reader
  belongs_to :forum
  belongs_to :card
  has_many :comments, dependent: :restrict_with_error

  def collocutors
    comments.map(&:reader).uniq
  end

  def self.visible_to_reader?(r)
    where(locale: I18n.locale.to_s)
      .where('comment_threads.comments_count > 0 OR
      comment_threads.reader_id = ?',
             r.id)
  end
end
