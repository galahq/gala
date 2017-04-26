class Question < ApplicationRecord
  has_many :answers
  belongs_to :quiz

  translates :content

  validates :content_i18n, presence: true

  def self.requiring_response_from reader
    where.not(id: Answer.by_reader(reader).select(:question_id))
  end

  def multiple_choice?
    question_type == :multiple_choice
  end

  def open_ended?
    question_type == :open_ended
  end

  private
  def question_type
    options.empty? ? :open_ended : :multiple_choice
  end
end
