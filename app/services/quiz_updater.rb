# frozen_string_literal: true

# Updates a {Quiz} by adding, updating, or deleting its {Question}s
class QuizUpdater
  attr_reader :quiz

  def initialize(quiz)
    @quiz = quiz
  end

  def update(quiz_params)
    quiz_params, questions = extract_quiz_and_questions(quiz_params)

    ActiveRecord::Base.transaction do
      quiz.new_record? ? handle_new_quiz(quiz_params, questions) : handle_existing_quiz(quiz_params, questions)
    end

    true
  rescue ActiveRecord::RecordInvalid => e
    add_error_message(e)
    false
  end

  private

  def handle_new_quiz(quiz_params, questions)
    assign_quiz_attributes(quiz_params)

    if questions&.any?
      save_without_validation
      process_questions(questions)
    end

    quiz.save! # Final save with validation
  end

  def handle_existing_quiz(quiz_params, questions)
    quiz.update!(quiz_params) if quiz_params.present?
    process_questions(questions) unless questions.nil?
  end

  def assign_quiz_attributes(quiz_params)
    quiz.assign_attributes(quiz_params) if quiz_params.present?
  end

  def save_without_validation
    quiz.skip_validation = true
    quiz.save!
    quiz.skip_validation = false
  end

  def process_questions(questions)
    sync_questions(questions)
    quiz.reload
    quiz.save!
  end

  def add_error_message(error)
    quiz.errors.add(:base, error.message) unless quiz.errors.any?
  end

  def extract_quiz_and_questions(quiz_params)
    quiz_params = quiz_params.to_h.with_indifferent_access
    questions = quiz_params.delete(:questions)
    [quiz_params, questions]
  end

  def extract_question_attributes(question)
    question.to_h.with_indifferent_access.slice(:id, :content, :correct_answer, :options)
  end

  def sync_questions(questions)
    delete_removed_questions(questions)
    quiz.reload
    update_or_create_questions(questions)
  end

  def delete_removed_questions(questions)
    question_ids_to_keep = questions.map { |q| q[:id] }.compact

    if question_ids_to_keep.empty?
      quiz.custom_questions.destroy_all
    else
      quiz.custom_questions.where.not(id: question_ids_to_keep).destroy_all
    end
  end

  def update_or_create_questions(questions)
    questions.each do |question_data|
      question_attrs = extract_question_attributes(question_data)

      if question_attrs[:id].present?
        quiz.custom_questions.find(question_attrs[:id]).update!(question_attrs)
      else
        quiz.custom_questions.create!(question_attrs)
      end
    end
  end
end
