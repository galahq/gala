# frozen_string_literal: true

require 'rails_helper'

RSpec.describe QuizUpdater, type: :model do
  let(:quiz) { create :quiz }

  describe '#initialize' do
    it 'can be initialized with a quiz to be updated' do
      subject = described_class.new quiz
      expect(subject.quiz).to eq quiz
    end
  end

  describe '#update' do
    subject { described_class.new quiz }

    it 'sets the title' do
      subject.update 'title' => 'new title'
      expect(quiz.title).to eq 'new title'
    end

    it 'replaces all questions with new ones' do
      # Start with 1 question from factory
      original_count = quiz.custom_questions.count
      expect(original_count).to be > 0

      question_attrs = { content: { en: "What's your favorite food?" }, correct_answer: 'Pizza', options: [] }
      subject.update 'questions' => [question_attrs]

      quiz.custom_questions.reload
      expect(quiz.custom_questions.count).to eq(1)
      expect(quiz.custom_questions.first.content['en']).to eq("What's your favorite food?")
    end

    it 'changes existing questions' do
      existing_question = quiz.custom_questions.first
      question_attrs = existing_question.attributes.merge(
        'content' => { 'en' => "What's your name?" }
      )
      subject.update 'questions' => [question_attrs]

      quiz.custom_questions.reload
      expect(quiz.custom_questions.first.content['en']).to eq("What's your name?")

      question_attrs['content'] = { 'en' => 'How old are you?' }
      subject.update 'questions' => [question_attrs]

      quiz.custom_questions.reload
      expect(quiz.custom_questions.first.content['en']).to eq('How old are you?')
    end

    it 'deletes questions that are not included anymore' do
      # Create a quiz with a template so it passes validation even with no custom questions
      template_quiz = create :quiz, case: quiz.case
      quiz.update!(template: template_quiz)

      expect(quiz.custom_questions).not_to be_empty
      subject.update 'questions' => []
      quiz.reload
      expect(quiz.custom_questions).to be_empty
    end

    it 'saves the quiz' do
      question_attrs = { content: { en: 'Test question' }, correct_answer: 'Test answer', options: [] }
      subject.update 'title' => 'New title',
                     'questions' => [question_attrs]

      quiz.reload
      expect(quiz.title).to eq('New title')
      expect(quiz.custom_questions.count).to eq(1)
      expect(quiz).not_to have_changes_to_save
    end

    it 'does nothing if parameters are omitted' do
      # Capture the initial state
      original_title = quiz.title
      original_questions = quiz.custom_questions.map do |q|
        { content: q.content, correct_answer: q.correct_answer, options: q.options }
      end

      subject.update({})

      # Verify nothing changed
      expect(quiz.reload.title).to eq(original_title)
      new_questions = quiz.custom_questions.map do |q|
        { content: q.content, correct_answer: q.correct_answer, options: q.options }
      end
      expect(new_questions).to eq(original_questions)
    end
  end
end
