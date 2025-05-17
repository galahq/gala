# frozen_string_literal: true

# Customizes a {Deployment} by creating or modifying a {Quiz} and its associated
# {Question}s
class CustomizeDeploymentService
  def initialize(deployment, author_id, lti_uid)
    @deployment = deployment
    @auth = AuthorIdentifier.new(author_id, lti_uid)
  end

  def customize(answers_needed: 0, quiz_id: nil, custom_questions: [])
    ActiveRecord::Base.transaction do
      @deployment.answers_needed = answers_needed
      if quiz_id || answers_needed.positive?
        @deployment.quiz = find_or_build_quiz(quiz_id, custom_questions)
        update_quiz_questions(custom_questions) unless custom_questions.empty?
      end
      @deployment.save!
      @deployment
    end
  rescue ActiveRecord::RecordInvalid => e
    e.record
  end

  private

  def find_or_build_quiz(quiz_id, custom_questions)
    return build_new_quiz unless quiz_id

    quiz = Quiz.find_by(id: quiz_id)
    return quiz if quiz && (can_edit_quiz?(quiz) || custom_questions.empty?)

    Quiz.create!(case: @deployment.case, template_id: quiz_id, customized: true)
  end

  def build_new_quiz
    @deployment.build_quiz(case: @deployment.case, customized: true, **@auth.quiz_attributes)
  end

  def can_edit_quiz?(quiz)
    @auth.author&.quiz?(quiz)
  end

  def update_quiz_questions(custom_questions)
    QuizUpdater.new(@deployment.quiz).update(@auth.quiz_attributes.merge(questions: custom_questions))
  end

  # Since deployment customization from an LTI ContentItemSelection request
  # can happen before the instructor's {Reader} account has been created, we
  # have to identify the author of a {Quiz} by {author_id} and {lti_uid} in
  # concert. {author_id} takes precedence if set; we fall back to {lti_uid}
  # (when creating and when finding quizzes) if not.
  class AuthorIdentifier
    attr_reader :author_id, :lti_uid

    def initialize(author_id, lti_uid)
      @author_id = author_id
      @lti_uid = lti_uid
    end

    def author
      @author ||= Reader.find_by(id: author_id)
    end

    def quiz_attributes
      if author_id
        { 'author_id' => author_id, 'lti_uid' => nil }
      else
        { 'author_id' => nil, 'lti_uid' => lti_uid }
      end
    end
  end
end
