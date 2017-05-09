json.key_format! camelize: :lower

if @selection_params
  json.return_url @selection_params[:return_url]
  json.return_data @selection_params[:return_data]
end

json.group do
  json.extract! @deployment.group, :name
end

json.case_data do
  json.extract! @deployment.case, :kicker, :title
  json.cover_url ix_cover_image(@deployment.case, :square)
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
