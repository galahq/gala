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
  json.quiz do
    json.partial! @deployment.quiz
  end
end

json.recommended_quizzes do
  @deployment.case.quizzes.recommended.each do |quiz|
    json.set! quiz.id do
      json.partial! quiz
    end
  end
end
