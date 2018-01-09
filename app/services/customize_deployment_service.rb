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
    return invalid.record
  end

  private

  def get_quiz(quiz_id, with_customizations:)
    quiz = Quiz.where(id: quiz_id).try(:first)
    return quiz if should_use_existing_quiz quiz, with_customizations

    create_quiz_from_template quiz_id
  end

  def should_use_existing_quiz(quiz, with_customizations)
    return false unless quiz # Can’t use existing if there isn’t one
    return true if @author_identifier.author.quiz? quiz # Can mutate their own
    with_customizations.empty? # Copy on write (only copy if needed)
  end

  def create_quiz_from_template(template_id)
    Quiz.create! case: @deployment.case,
                 template_id: template_id,
                 customized: true
  end

  def customize_quiz(custom_questions)
    delete_questions_not_included_in(custom_questions.map { |q| q['id'] })
    upsert_questions custom_questions
    set_quiz_author
  end

  def set_quiz_author
    @deployment.quiz.update @author_identifier.quiz_attributes
  end

  def delete_questions_not_included_in(question_ids)
    @deployment.quiz.custom_questions.each do |question|
      question.destroy unless question_ids.include? question.id
    end
  end

  def upsert_questions(custom_questions)
    custom_questions.each do |question|
      if question['id']
        Question.find(question['id']).update! question
      else
        @deployment.quiz.custom_questions.create! question
      end
    end
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
