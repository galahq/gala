# frozen_string_literal: true

class Case
  # One {Reader}’s progress in studying a {Case}
  class Progression
    attr_reader :deployment, :reader

    delegate :case, :pretest_assigned?, :quiz, to: :deployment
    delegate :name, to: :reader, prefix: true

    def initialize(reader, deployment)
      @reader = reader
      @deployment = deployment
    end

    def completed_fraction
      enrollment.case_completion
    end

    def pretest_submitted?
      pretest_submission.present?
    end

    def pretest_submission
      return nil unless pretest_assigned?
      submissions.first
    end

    def posttest_submitted?
      posttest_submission.present?
    end

    def posttest_submission
      return submissions.first unless pretest_assigned?
      submissions.second
    end

    private

    def enrollment
      @enrollment ||= reader.enrollment_for_case self.case
    end

    def submissions
      return Submission.none unless quiz.present?
      @submissions ||= quiz.submissions.where(reader: reader)
    end
  end
end
