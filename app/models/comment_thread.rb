class CommentThread < ApplicationRecord
  belongs_to :reader
  belongs_to :group
  belongs_to :card
  belongs_to :case
  has_many :comments

  def visible_to_reader?(r)
    comments.length > 0 || reader == r
  end

end
