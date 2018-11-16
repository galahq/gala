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
  end

  private

  def upsert_questions(questions)
    questions.each do |question|
      upsert_question question
    end
  end

  def upsert_question(question)
    if question['id'].present?
      Question.find(question['id']).update! question
    else
      quiz.custom_questions.create! question
    end
  end

  def delete_questions_not_included_in(questions)
    question_ids = questions.map { |q| q['id'] }
    quiz.custom_questions.each do |old_question|
      old_question.destroy unless question_ids.include? old_question.id
    end
  end
end
