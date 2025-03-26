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
      return @deployment.tap(&:save!) if answers_needed.zero?

      # There will be a quiz administered
      @deployment.quiz = get_quiz quiz_id, with_customizations: custom_questions
      return @deployment.tap(&:save!) if custom_questions.empty?

      # The quiz has custom questions
      customize_quiz custom_questions
      @deployment.tap(&:save!)
    end
  rescue ActiveRecord::RecordInvalid => invalid
    invalid.record
  end

  private

  def get_quiz(quiz_id, with_customizations:)
    quiz = Quiz.where(id: quiz_id).try(:first)
    return quiz if should_use_existing_quiz quiz, with_customizations

    create_quiz_from_template quiz_id
  end

  def should_use_existing_quiz(quiz, with_customizations)
    return false unless quiz # Can't use existing if there isn't one
    return true if @author_identifier.author.quiz? quiz # Can mutate their own

    with_customizations.empty? # Copy on write (only copy if needed)
  end

  def create_quiz_from_template(template_id)
    template_quiz = Quiz.create! case: @deployment.case,
                                 template_id: template_id,
                                 customized: true
    template_quiz.reload
    puts "Template Quiz ID: #{template_quiz.id}"
    puts "Template Quiz Case ID: #{template_quiz.case_id}"
    template_quiz
  end

  def customize_quiz(custom_questions)
    quiz_params = @author_identifier.quiz_attributes
                                    .merge questions: custom_questions
    QuizUpdater.new(@deployment.quiz).update quiz_params
  end

  # Since deployment customization from an LTI ContentItemSelection request
  # can happen before the instructor’s {Reader} account has been created, we
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
      @author ||= Reader.find author_id
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
