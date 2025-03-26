# frozen_string_literal: true

# A deployment is the connection between a {Group} and a {Case}. It’s the model
# on which live any customizations that the instructor wants to make. The most
# significant so far is the pre/post quiz that the instructor has chosen to use.
#
# @attr answers_needed [Numeric] the number of submissions needed from each
#   user. We only handle values 0–2, so far:
#   - 2 means pre and post quizzes
#   - 1 means just a post quiz
#   - 0 means no quiz (and assumes quiz == nil)
# @attr key [String] a random URL safe string used as the hard-to-guess
#   identifier that allows the {MagicLink} to work
#
# @see GenericDeployment GenericDeployment: this model’s null object
class Deployment < ApplicationRecord
  default_scope { order created_at: :desc }

  attribute :answers_needed, :integer, default: 0
  attribute :key, :string, default: -> { SecureRandom.urlsafe_base64 }

  belongs_to :case
  belongs_to :group
  belongs_to :quiz, optional: true

  has_many :readers, through: :group
  has_many :enrollments, ->(this) { where(reader: this.readers) },
           through: :case

  has_one :community, through: :group
  has_one :forum, ->(this) { where case: this.case },
          through: :community, source: :forums

  accepts_nested_attributes_for :group

  validates :case_id, uniqueness: { scope: :group_id }
  validates :quiz, presence: true, if: -> { answers_needed.positive? }

  after_create :create_forum

  def reader_progressions(scope: readers)
    scope.joins(:enrollments)
         .includes(enrollments: :reader)
         .where(enrollments: { case_id: self.case.id })
         .map { |reader| Case::Progression.new reader, self }
  end

  # Ensure that there is a forum for this group’s community to discuss this case
  def create_forum
    group.community.forums.create case: self.case
  end

  def pretest_assigned?
    answers_needed >= 2
  end

  def hide_pretest?(reader)
    (!quiz || reader.enrollment_for_case(self.case).instructor?) &&
      Rails.env.production?
  end

  def reader_needs_pretest?(reader)
    return false if hide_pretest?(reader)

    answers_needed - quiz.number_of_responses_from(reader) >= 2
  end

  def posttest_assigned?
    answers_needed.positive? && quiz.present?
  end

  def reader_needs_posttest?(reader)
    return false unless quiz

    answers_needed - quiz.number_of_responses_from(reader) >= 1
  end
end
