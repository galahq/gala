# frozen_string_literal: true

# A pre/post quiz, particular to a {Case}, consisting of multiple {Question}s.
#
# Quizzes exist in an inheritance chain: the quiz’s {template} is its direct
# parent, and each quiz consists of some custom questions preceeded,
# recursively, by its anscestors’ questions.
#
# Quizzes belong to a particular {author}, and appear in the deployment
# customization workflow as choices to only that author. Because some authors,
# following an LTI ContentItemsSelection request, are identified to us only by
# their {lti_uid}, quizzes are associated with an author in two ways:
# {author} takes precedence if set, falling back to {lti_uid} if not. The
# {CustomizeDeploymentService} normalizes this, setting {author} as soon as
# it is known.
#
# Quizzes where `author == nil` are our “provided” assessments and appear to all
# instructors.
#
# @attr title [String]
# @attr customized [Boolean]
# @attr lti_uid [String] the unique identifier of an LMS user who has not yet
#   had a {Reader} and associated {AuthenticationStrategy} created
class Quiz < ApplicationRecord
  has_many :custom_questions, class_name: 'Question', dependent: :destroy
  has_many :deployments, dependent: :nullify
  has_many :submissions, -> { order created_at: :asc }, dependent: :destroy

  belongs_to :author, class_name: 'Reader', optional: true
  belongs_to :case
  belongs_to :template, class_name: 'Quiz', optional: true

  scope :suggested, -> { joins(:custom_questions).where(author_id: nil, lti_uid: nil) }

  validate :must_have_questions, unless: -> { Rails.env.test? }

  # A relation of quizzes that the reader, in the context of her active group,
  # hasn’t answered enough times. Whether ”enough” is 1 or 2 depends on the
  # instructor’s choice, per {Deployment}.
  # @return [ActiveRecord::Relation<Quiz>]
  def self.requiring_response_from(reader)
    where(id: reader.deployments.select(:quiz_id))
      .where(id: Question.requiring_response_from(reader).select(:quiz_id))
  end

  # Quizzes authored by the given reader, identified by {author} and {lti_uid}
  # in concert.
  # @return [ActiveRecord::Relation<Quiz>]
  def self.authored_by(reader: nil, lti_uid: nil)
    if reader
      where <<~SQL.squish, reader_id: reader.id, lti_uid: reader.lti_uid
        author_id = :reader_id OR (lti_uid = :lti_uid AND lti_uid IS NOT NULL)
      SQL

    elsif lti_uid
      where lti_uid: lti_uid
    else
      []
    end
  end

  # The quizzes from which this quiz inherits its shared questions.
  # @return [ActiveRecord::Relation<Quiz>]
  def ancestors
    @ancestors ||= Quiz.where(<<~SQL.squish, quiz_id: id)
      id IN (
        WITH RECURSIVE template_quizzes(id, template_id) AS (
            SELECT id, template_id
              FROM quizzes
             WHERE id = :quiz_id
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

  def questions
    Question.where(quiz_id: ancestors.pluck(:id)).order(:created_at)
  end

  def answers
    Answer.where question_id: questions.select(:id)
  end

  def requires_response_from?(reader, in_group:)
    questions.requiring_response_from(reader, in_group: in_group).any?
  end

  # The number of responses to this quiz already made by a given reader
  def number_of_responses_from(reader)
    answers.merge(reader.answers).group(:question_id).count(:question_id)
           .values.min || 0
  end

  private

  def must_have_questions
    return if custom_questions.any? || (template.present? && template.questions.exists?)

    errors.add(:base, 'Quiz must have at least one question.')
  end
end
