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
      # For new quizzes, we need to save first before adding questions
      if quiz.new_record?
        # Set attributes but don't save yet
        quiz.assign_attributes(quiz_params) if quiz_params.present?

        if questions&.any?
          # Save without validation to create the record
          quiz.skip_validation = true
          quiz.save!
          quiz.skip_validation = false

          # Now add the questions
          sync_questions(questions)

          # Validate the complete quiz
          quiz.reload
        end
        # Save with validation - will fail if no questions
        quiz.save!
      else
        # Existing quiz - normal update flow
        quiz.update!(quiz_params) if quiz_params.present?

        unless questions.nil?
          sync_questions(questions)
          quiz.reload
          quiz.save!
        end
      end
    end

    true
  rescue ActiveRecord::RecordInvalid => e
    quiz.errors.add(:base, e.message) unless quiz.errors.any?
    false
  end

  private

  def extract_quiz_and_questions(quiz_params)
    quiz_params = quiz_params.to_h.with_indifferent_access
    questions = quiz_params.delete(:questions)
    [quiz_params, questions]
  end

  def extract_question_attributes(question)
    question.to_h.with_indifferent_access.slice(:id, :content, :correct_answer, :options)
  end

  def sync_questions(questions)
    # Get IDs of questions to keep
    question_ids_to_keep = questions.map { |q| q[:id] }.compact

    # Delete questions not in the new set
    if question_ids_to_keep.empty?
      # If no IDs provided, delete all questions
      quiz.custom_questions.destroy_all
    else
      # Delete only questions not in the keep list
      quiz.custom_questions.where.not(id: question_ids_to_keep).destroy_all
    end

    # Create or update questions
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
