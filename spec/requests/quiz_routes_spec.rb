# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Quiz routes' do
  let(:kase) { create :case_with_elements }
  let(:reader) { create :reader }
  let!(:enrollment) { create :enrollment, case: kase, reader: reader }

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
    reader.my_cases << kase
    sign_in reader
  end

  def valid_question(content = 'What should a route spec cover?')
    {
      content: content,
      correctAnswer: 'JSON behavior',
      options: []
    }
  end

  describe 'GET /cases/:case_slug/quizzes.json' do
    it 'returns suggested quizzes for an editable case' do
      quiz = create :quiz, :suggested, case: kase, title: 'Route Quiz'

      get "/cases/#{kase.slug}/quizzes.json"

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        including(
          id: quiz.id,
          title: 'Route Quiz',
          param: quiz.to_param,
          questions: including(
            including(correctAnswer: quiz.custom_questions.first.correct_answer)
          )
        )
      )
    end
  end

  describe 'POST /cases/:case_slug/quizzes.json' do
    it 'creates a suggested quiz through QuizUpdater' do
      expect do
        post "/cases/#{kase.slug}/quizzes.json",
             params: {
               quiz: {
                 title: 'Created Route Quiz',
                 questions: [valid_question]
               }
             },
             as: :json
      end.to change(Quiz, :count).by(1)

      quiz = Quiz.last
      expect(response).to have_http_status(:ok)
      expect(quiz.author_id).to be_nil
      expect(quiz.custom_questions.first.content).to eq(
        'What should a route spec cover?'
      )
      expect(response.body).to be_json including(
        title: 'Created Route Quiz',
        questions: including(including(correctAnswer: 'JSON behavior'))
      )
    end

    it 'returns 422 for invalid quiz data' do
      post "/cases/#{kase.slug}/quizzes.json",
           params: { quiz: { title: 'Invalid Route Quiz', questions: [] } },
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to be_json including(
        base: including('Quiz must have at least one question.')
      )
    end
  end

  describe 'GET /quizzes/:id.json' do
    it 'returns answer-bearing quiz JSON after the reader has submitted enough answers' do
      group = create :group
      create :group_membership, group: group, reader: reader
      quiz = create :quiz, case: kase
      create :deployment, case: kase, group: group, quiz: quiz,
                          answers_needed: 1
      create :submission, quiz: quiz, reader: reader

      get "/quizzes/#{quiz.id}.json"

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        id: quiz.id,
        questions: including(
          including(correctAnswer: quiz.custom_questions.first.correct_answer)
        )
      )
    end
  end

  describe 'PATCH /quizzes/:id.json' do
    let(:quiz) { create :quiz, :suggested, case: kase, title: 'Original Quiz' }

    it 'updates a suggested quiz through QuizUpdater' do
      patch "/quizzes/#{quiz.id}.json",
            params: {
              quiz: {
                title: 'Updated Route Quiz',
                questions: [
                  valid_question('What changed in this route spec?')
                ]
              }
            },
            as: :json

      expect(response).to have_http_status(:ok)
      quiz.reload
      expect(quiz.title).to eq('Updated Route Quiz')
      expect(quiz.custom_questions.first.content).to eq(
        'What changed in this route spec?'
      )
      expect(response.body).to be_json including(title: 'Updated Route Quiz')
    end

    it 'returns 422 for invalid updates' do
      patch "/quizzes/#{quiz.id}.json",
            params: { quiz: { questions: [] } },
            as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to be_json including(
        base: including('Quiz must have at least one question.')
      )
    end
  end

  describe 'DELETE /quizzes/:id.json' do
    it 'destroys a suggested quiz' do
      quiz = create :quiz, :suggested, case: kase

      expect do
        delete "/quizzes/#{quiz.id}.json"
      end.to change(Quiz, :count).by(-1)

      expect(response).to have_http_status(:no_content)
      expect(Quiz.exists?(quiz.id)).to be false
    end
  end

  describe 'GET /quizzes/:quiz_id/submissions.json' do
    it 'returns the current reader submissions for a quiz' do
      quiz = create :quiz, case: kase
      submission = create :submission, quiz: quiz, reader: reader
      answer = create :answer, quiz: quiz,
                               question: quiz.custom_questions.first,
                               reader: reader,
                               submission: submission,
                               content: 'A route answer'

      get "/quizzes/#{quiz.id}/submissions.json"

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        submissions: including(
          submission.id.to_s.to_sym => including(
            id: submission.id,
            readerId: reader.id,
            answersByQuestionId: including(
              answer.question_id.to_s.to_sym => including(
                content: 'A route answer'
              )
            )
          )
        )
      )
    end
  end

  describe 'POST /quizzes/:quiz_id/submissions.json' do
    it 'creates a submission for the enrolled reader' do
      group = create :group
      create :group_membership, group: group, reader: reader
      quiz = create :quiz, case: kase
      create :deployment, :with_pretest, case: kase, group: group, quiz: quiz
      enrollment.update!(active_group: group)

      expect do
        post "/quizzes/#{quiz.id}/submissions.json",
             params: {
               answers: [
                 {
                   question_id: quiz.custom_questions.first.id,
                   content: 'Submitted answer'
                 }
               ]
             },
             as: :json
      end.to change(Submission, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.body).to be_json including(
        needsPretest: true,
        needsPosttest: true
      )
    end
  end
end
