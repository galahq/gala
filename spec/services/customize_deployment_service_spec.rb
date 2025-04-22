# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomizeDeploymentService do
  let(:kase) { create :case }
  let(:group) { create :group }
  let(:deployment) { create :deployment, case: kase, group: group }
  let(:reader) { create :reader }
  let(:lti_uid) { 'test_lti_uid' }
  let(:service) { described_class.new(deployment, reader.id, lti_uid) }
  let(:default_quiz) { create :quiz, case: kase, author_id: nil, lti_uid: nil }
  let(:custom_questions) do
    [
      { content: { en: 'Question 1' }, correct_answer: 'Answer 1', options: ['Answer 1', 'Wrong 1'] },
      { content: { en: 'Question 2' }, correct_answer: 'Answer 2', options: ['Answer 2', 'Wrong 2'] }
    ]
  end

  describe '#customize' do
    shared_examples 'sets deployment properties' do |answers_needed_value|
      it 'returns the deployment' do
        expect(result).to eq(deployment)
      end

      it "sets answers_needed to #{answers_needed_value}" do
        expect(result.answers_needed).to eq(answers_needed_value)
      end
    end

    context 'when answers_needed is 0' do
      let(:result) { service.customize(answers_needed: 0) }

      include_examples 'sets deployment properties', 0

      it 'does not require a quiz' do
        expect(result.quiz).to be_nil
      end
    end

    context 'when answers_needed is positive with a quiz_id' do
      let!(:quiz_for_test) { create :quiz, case: kase, author_id: nil, lti_uid: nil }
      let(:result) { service.customize(answers_needed: 1, quiz_id: quiz_for_test.id) }

      include_examples 'sets deployment properties', 1

      it 'sets the quiz' do
        expect(result.quiz).to eq(quiz_for_test)
      end
    end

    context 'with custom questions' do
      let!(:quiz_for_custom) { create :quiz, case: kase, author_id: nil, lti_uid: nil }

      it 'creates a new customized quiz' do
        expect do
          @result = service.customize(
            answers_needed: 1,
            quiz_id: quiz_for_custom.id,
            custom_questions: custom_questions
          )
        end.to change(Quiz, :count).by(1)

        expect(@result.quiz.id).not_to eq(quiz_for_custom.id)
        expect(@result.quiz.template_id).to eq(quiz_for_custom.id)
        expect(@result.quiz.customized).to be true
        expect(@result.quiz.case).to eq(kase)
        expect(@result.quiz.author_id).to eq(reader.id)
        expect(@result.quiz.lti_uid).to be_nil
      end

      it 'adds the custom questions to the quiz' do
        result = service.customize(
          answers_needed: 1,
          quiz_id: quiz_for_custom.id,
          custom_questions: custom_questions
        )

        expect(result.quiz.custom_questions.count).to eq(2)
        custom_questions_content = result.quiz.custom_questions.map { |q| q.content['en'] }
        expect(custom_questions_content).to match_array(['Question 1', 'Question 2'])
      end
    end

    context 'reusing existing quizzes' do
      context 'with author-owned quiz' do
        let(:author_quiz) { create :quiz, case: kase, author_id: reader.id }

        before do
          allow_any_instance_of(Reader).to receive(:quiz?).and_call_original
          allow(reader).to receive(:quiz?).with(author_quiz).and_return(true)
        end

        it 'reuses the quiz when author owns it' do
          expect do
            result = service.customize(answers_needed: 1, quiz_id: author_quiz.id)
            expect(result.quiz).to eq(author_quiz)
          end.not_to change(Quiz, :count)
        end

        it 'allows customization of author-owned quiz' do
          single_question = [{ content: { en: 'New question' }, correct_answer: 'Answer', options: %w[Answer Wrong] }]

          expect do
            result = service.customize(answers_needed: 1, quiz_id: author_quiz.id, custom_questions: single_question)
            expect(result.quiz).to eq(author_quiz)
            expect(result.quiz.custom_questions.last.content['en']).to eq('New question')
          end.not_to change(Quiz, :count)
        end
      end

      context 'with another author quiz' do
        let(:another_reader) { create :reader }
        let(:another_author_quiz) { create :quiz, case: kase, author_id: another_reader.id }

        before do
          allow_any_instance_of(CustomizeDeploymentService).to receive(:should_use_existing_quiz)
            .with(another_author_quiz, anything).and_return(false)
        end

        it 'creates a copy when customizing' do
          expect do
            result = service.customize(answers_needed: 1, quiz_id: another_author_quiz.id)
            expect(result.quiz.id).not_to eq(another_author_quiz.id)
            expect(result.quiz.template_id).to eq(another_author_quiz.id)
          end.to change(Quiz, :count).by(1)
        end
      end

      context 'with LTI identification' do
        let(:lti_service) { described_class.new(deployment, nil, lti_uid) }
        let(:lti_quiz) { create :quiz, case: kase, author_id: nil, lti_uid: lti_uid }
        let!(:lti_default_quiz) { create :quiz, case: kase, author_id: nil, lti_uid: nil }

        before do
          author_identifier_class = CustomizeDeploymentService::AuthorIdentifier
          allow_any_instance_of(author_identifier_class).to receive(:author).and_return(nil)

          allow_any_instance_of(CustomizeDeploymentService).to receive(:should_use_existing_quiz)
            .and_call_original
          allow_any_instance_of(CustomizeDeploymentService).to receive(:should_use_existing_quiz)
            .with(lti_quiz, anything).and_return(true)
          allow_any_instance_of(CustomizeDeploymentService).to receive(:should_use_existing_quiz)
            .with(lti_default_quiz, anything).and_return(false)
        end

        it 'reuses existing quiz when lti_uid matches' do
          expect do
            result = lti_service.customize(answers_needed: 1, quiz_id: lti_quiz.id)
            expect(result.quiz).to eq(lti_quiz)
          end.not_to change(Quiz, :count)
        end

        it 'creates quiz with lti_uid attribution when no author_id present' do
          lti_question = [{ content: { en: 'LTI Question' }, correct_answer: 'Answer', options: %w[Answer Wrong] }]

          expect do
            result = lti_service.customize(
              answers_needed: 1,
              quiz_id: lti_default_quiz.id,
              custom_questions: lti_question
            )
            expect(result.quiz.author_id).to be_nil
            expect(result.quiz.lti_uid).to eq(lti_uid)
          end.to change(Quiz, :count).by(1)
        end
      end
    end
  end

  describe 'AuthorIdentifier' do
    let(:author_identifier) { CustomizeDeploymentService::AuthorIdentifier.new(reader.id, lti_uid) }

    it 'provides author attributes with author_id when present' do
      attributes = author_identifier.quiz_attributes
      expect(attributes['author_id']).to eq(reader.id)
      expect(attributes['lti_uid']).to be_nil
    end

    it 'provides author attributes with lti_uid when author_id is nil' do
      lti_identifier = CustomizeDeploymentService::AuthorIdentifier.new(nil, lti_uid)
      attributes = lti_identifier.quiz_attributes
      expect(attributes['author_id']).to be_nil
      expect(attributes['lti_uid']).to eq(lti_uid)
    end

    it 'finds the author by id' do
      expect(author_identifier.author).to eq(reader)
    end
  end
end
