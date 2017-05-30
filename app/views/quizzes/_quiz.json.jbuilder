json.key_format! camelize: :lower

json.extract! quiz, :id
json.questions do
  json.array! quiz.questions do |question|
    json.extract! question, :id, :content, :options
  end
end
