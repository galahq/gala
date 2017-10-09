# frozen_string_literal: true

class Quiz < ApplicationRecord
  include Authority::Abilities

  has_many :deployments, dependent: :nullify
  has_many :custom_questions, class_name: 'Question', dependent: :destroy
  belongs_to :case
  belongs_to :template, class_name: 'Quiz'
  belongs_to :author, class_name: 'Reader'

  scope :recommended, -> { where author_id: nil, lti_uid: nil }

  def self.requiring_response_from(reader)
    where(id: reader.deployments.select(:quiz_id))
      .where(id: Question.requiring_response_from(reader).select(:quiz_id))
  end

  def self.authored_by(reader: nil, lti_uid: nil)
    if reader
      where <<~SQL, reader_id: reader.id, lti_uid: reader.lti_uid
        author_id = :reader_id OR (lti_uid = :lti_uid AND lti_uid IS NOT NULL)
        SQL

    elsif lti_uid
      where lti_uid: lti_uid
    else
      []
    end
  end

  def questions
    Question.where <<~SQL
      questions.quiz_id IN (
        WITH RECURSIVE template_quizzes(id, template_id) AS (
            SELECT id, template_id
              FROM quizzes
             WHERE id = #{id}
          UNION ALL
            SELECT quizzes.id, quizzes.template_id
              FROM template_quizzes, quizzes
             WHERE quizzes.id = template_quizzes.template_id
        )
        SELECT id
          FROM template_quizzes
      )
    SQL
  end

  def answers
    Answer.where question_id: questions.select(:id)
  end

  def requires_response_from?(reader, in_group:)
    questions.requiring_response_from(reader, in_group: in_group).any?
  end

  def number_of_responses_from(reader)
    answers.merge(reader.answers).group(:question_id).count(:question_id)
           .values.min || 0
  end
end
