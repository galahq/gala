# frozen_string_literal: true

# Updates a {Quiz} by adding, updating, or deleting its {Question}s
class QuizUpdater
  attr_reader :quiz

  def initialize(quiz)
    @quiz = quiz
  end

  def update(quiz_params)
    quiz_params = quiz_params.to_h.transform_keys(&:to_s)
    questions = quiz_params.delete 'questions'

    quiz.update quiz_params

    return if questions.nil?

    delete_questions_not_included_in questions
    upsert_questions questions

    # Reload the association so the validation can see the newly created questions
    quiz.custom_questions.reload
    quiz.save!
  end

  def upsert(quiz_params)
    quiz_params = quiz_params.to_h.transform_keys(&:to_s)
    questions = quiz_params.delete 'questions'
    ActiveRecord::Base.transaction do
      quiz.save validate: false
      questions.each do |question|
        # Convert question to hash with string keys, then extract only the permitted attributes
        question_hash = question.to_h.transform_keys(&:to_s)
        question_attrs = question_hash.slice(*question_attributes)
        quiz.custom_questions.create! question_attrs
      end
      # Reload the association so the validation can see the newly created questions
      quiz.custom_questions.reload
      quiz.save!
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "===========> Record invalid: #{e.message}"
    false
  end

  private

  def question_attributes
    %w[id content correct_answer options]
  end

  def upsert_questions(questions)
    questions.each do |question|
      upsert_question question
    end
  end

  def upsert_question(question)
    # Convert question to hash with string keys, then extract only the permitted attributes
    question_hash = question.to_h.transform_keys(&:to_s)
    question_attrs = question_hash.slice(*question_attributes)

    if question_attrs['id'].present?
      Question.find(question_attrs['id']).update! question_attrs
    else
      quiz.custom_questions.create! question_attrs
    end
  end

  def delete_questions_not_included_in(questions)
    question_ids = questions.map { |q| q['id'] }
    quiz.custom_questions.each do |old_question|
      old_question.destroy unless question_ids.include? old_question.id
    end
  end
end
