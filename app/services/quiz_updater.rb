# frozen_string_literal: true

# Updates a {Quiz} by adding, updating, or deleting its {Question}s
class QuizUpdater
  attr_reader :quiz

  def initialize(quiz)
    @quiz = quiz
  end

  def update(quiz_params)
    quiz_params, questions = extract_quiz_and_questions(quiz_params)

    quiz.update quiz_params

    return if questions.nil?

    delete_questions_not_included_in questions
    upsert_questions questions

    # Reload the association so the validation can see the newly created questions
    quiz.custom_questions.reload
    quiz.save!
  end

  def upsert(quiz_params)
    _quiz_params, questions = extract_quiz_and_questions(quiz_params)
    ActiveRecord::Base.transaction do
      quiz.save validate: false
      questions.each do |question|
        quiz.custom_questions.create! extract_question_attributes(question)
      end
      quiz.reload.save!
    end
  rescue ActiveRecord::RecordInvalid => _e
    false
  end

  private

  def extract_quiz_and_questions(quiz_params)
    quiz_params = quiz_params.to_h.transform_keys(&:to_s)
    questions = quiz_params.delete 'questions'
    [quiz_params, questions]
  end

  def extract_question_attributes(question)
    question.to_h.transform_keys(&:to_s).slice(*question_attributes)
  end

  def question_attributes
    %w[id content correct_answer options]
  end

  def upsert_questions(questions)
    questions.each do |question|
      upsert_question question
    end
  end

  def upsert_question(question)
    question_attrs = extract_question_attributes(question)

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
