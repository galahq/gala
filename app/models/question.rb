class Question < ApplicationRecord
  has_many :answers
  belongs_to :quiz

  translates :content

  validates :content_i18n, presence: true

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
