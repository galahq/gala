# frozen_string_literal: true

# Customizes a {Deployment} by creating or modifying a {Quiz} and its associated
# {Question}s
class CustomizeDeploymentService
  def initialize(deployment, author_id, lti_uid)
    @deployment = deployment
    @author_identifier = AuthorIdentifier.new author_id, lti_uid
  end

  def customize(answers_needed: 0, quiz_id: nil, custom_questions: [])
    ActiveRecord::Base.transaction do
      @deployment.answers_needed = answers_needed

      if answers_needed.positive?
        @deployment.quiz = find_or_create_quiz(quiz_id, custom_questions)

        # Apply custom questions if provided
        if custom_questions.any?
          quiz_params = { questions: custom_questions }
          unless QuizUpdater.new(@deployment.quiz).update(quiz_params)
            raise ActiveRecord::RecordInvalid, @deployment.quiz
          end
        end
      end

      @deployment.save!
    end

    @deployment
  rescue ActiveRecord::RecordInvalid => e
    e.record
  end

  private

  def find_or_create_quiz(quiz_id, custom_questions)
    if quiz_id.present?
      existing_quiz = Quiz.find_by(id: quiz_id)

      # Use existing quiz if author owns it or it's a suggested quiz with no customizations
      if existing_quiz && can_use_existing_quiz?(existing_quiz, custom_questions)
        existing_quiz
      else
        create_quiz_from_template(quiz_id)
      end
    else
      create_new_quiz
    end
  end

  def can_use_existing_quiz?(quiz, custom_questions)
    # Author can always modify their own quiz
    return true if @author_identifier.author&.quiz?(quiz)

    # LTI user can modify their own quiz (matched by lti_uid)
    return true if @author_identifier.lti_uid.present? && quiz.lti_uid == @author_identifier.lti_uid

    # For suggested quizzes (no author), only reuse if no customizations are being added
    return custom_questions.empty? if quiz.author_id.nil? && quiz.lti_uid.nil?

    # Otherwise, don't reuse
    false
  end

  def create_new_quiz
    quiz = Quiz.new(
      case: @deployment.case,
      customized: true,
      **@author_identifier.quiz_attributes
    )
    quiz.save_without_validation!
    quiz
  end

  def create_quiz_from_template(template_id)
    quiz = Quiz.new(
      case: @deployment.case,
      template_id: template_id,
      customized: true,
      **@author_identifier.quiz_attributes
    )
    quiz.save_without_validation!
    quiz
  end

  # Since deployment customization from an LTI ContentItemSelection request
  # can happen before the instructor's {Reader} account has been created, we
  # have to identify the author of a {Quiz} by {author_id} and {lti_uid} in
  # concert. {author_id} takes precedence if set; we fall back to {lti_uid}
  # (when creating and when finding quizzes) if not.
  class AuthorIdentifier
    attr_accessor :author_id, :lti_uid

    def initialize(author_id, lti_uid)
      @author_id = author_id
      @lti_uid = lti_uid
    end

    def author
      @author ||= Reader.find_by(id: author_id)
    end

    def quiz_attributes
      if @author_id
        { 'author_id' => @author_id, 'lti_uid' => nil }
      else
        { 'author_id' => nil, 'lti_uid' => @lti_uid }
      end
    end
  end
end
