# frozen_string_literal: true

json.key_format! camelize: :lower

json.set! :submissions do
  @submissions.each do |submission|
    json.set! submission.id do
      json.extract! submission, :id, :reader_id, :quiz_id, :created_at
      json.answers_by_question_id do
        submission.answers.each do |answer|
          json.set! answer.question_id do
            json.extract! answer, :id, :question_id, :content, :created_at, :correct
          end
        end
      end
    end
  end
end
