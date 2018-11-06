# frozen_string_literal: true

json.key_format! camelize: :lower

json.id deployment.id

if selection_params
  json.return_url selection_params['return_url']
  json.return_data selection_params['return_data']
end

json.case_data do
  json.extract! deployment.case, :title
  json.kicker deployment.case.short_title
  json.cover_url deployment.case.decorate.cover_url
  json.callback_url do
    authentication_strategy_lti_omniauth_callback_url(
      case_slug: deployment.case.slug
    )
  end
end

json.selected_quiz_id deployment.quiz.id if deployment.quiz

if @recommended_quizzes
  json.recommended_quizzes({})
  json.recommended_quizzes do
    @recommended_quizzes.each do |quiz|
      json.set! quiz.id do
        json.extract! quiz, :id

        if current_reader == quiz.author ||
           current_reader.lti_uid == quiz.lti_uid
          json.questions (quiz.template.try(:questions) || []),
                         partial: 'questions/question', as: :question
          json.custom_questions quiz.custom_questions,
                                partial: 'questions/question', as: :question
        else
          json.questions quiz.questions, partial: 'questions/question',
                                         as: :question
          json.custom_questions []
        end
      end
    end
  end
end
