class Question < ApplicationRecord
  has_many :answers
  belongs_to :quiz

  translates :content

  validates :content_i18n, presence: true

  def self.requiring_response_from reader, in_group:
    # where.not(id: Answer.by_reader(reader).select(:question_id))
    where <<~SQL, reader_id: reader.id, group_id: in_group.id
      (
        SELECT COUNT(answers.id) FROM answers
        WHERE answers.question_id = questions.id
          AND answers.reader_id = :reader_id
      ) < (
        SELECT deployments.answers_needed FROM deployments
        WHERE deployments.group_id = :group_id
          AND deployments.quiz_id = questions.quiz_id
      )
    SQL
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
