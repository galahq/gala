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

    it 'adds new questions' do
      question = attributes_for :question, content: "What's your favorite food?"
      subject.update 'questions' => [question]
      expect(quiz.questions.i18n.where(content: "What's your favorite food?"))
        .to exist
    end

    it 'changes existing questions' do
      question = quiz.questions.first.attributes
      question['content'] = "What's your name?"
      subject.update 'questions' => [question]
      expect(quiz.questions.i18n.where(content: "What's your name?"))
        .to exist

      question['content'] = 'How old are you?'
      subject.update 'questions' => [question]
      expect(quiz.questions.i18n.where(content: "What's your name?"))
        .not_to exist
    end

    it 'deletes questions that are not included anymore' do
      expect(quiz.questions).not_to be_empty
      subject.update 'questions' => []
      expect(quiz.questions).to be_empty
    end

    it 'saves the quiz' do
      subject.update 'title' => 'New title',
                     'questions' => [attributes_for(:question)]
      expect(quiz).not_to have_changes_to_save
    end

    it 'does nothing if parameters are omitted' do
      subject.update({})
      expect(quiz.saved_changes?).to be_falsey
      expect(quiz.questions.map(&:saved_changes?)).not_to include true
    end
  end
end
