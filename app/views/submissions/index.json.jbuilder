# frozen_string_literal: true

json.key_format! camelize: :lower

json.set! :answers_by_question_id do
  @answers.group_by(&:question_id).each do |question_id, answers|
    json.set! question_id do
      json.array! answers do |answer|
        json.extract! answer, :id, :quiz_id, :content, :created_at, :correct
      end
    end
  end
end
