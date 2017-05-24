json.key_format! camelize: :lower

json.id @deployment.id

if @selection_params
  json.return_url @selection_params["return_url"]
  json.return_data @selection_params["return_data"]
end

json.case_data do
  json.extract! @deployment.case, :kicker, :title
  json.cover_url ix_cover_image(@deployment.case, :square)
  json.callback_url authentication_strategy_lti_omniauth_callback_url case_slug: @deployment.case.slug
end

if @deployment.quiz
  json.selected_quiz_id @deployment.quiz.id
end

if @recommended_quizzes
  json.recommended_quizzes Hash.new
  json.recommended_quizzes do
    @recommended_quizzes.each do |quiz|
      json.set! quiz.id do
        json.extract! quiz, :id

        if current_reader == quiz.author || current_reader.lti_uid == quiz.lti_uid
          json.questions (quiz.template.try(:question) || []), partial: 'questions/question', as: :question
          json.custom_questions quiz.custom_questions, partial: 'questions/question', as: :question
        end
      end
    end
  end
end
