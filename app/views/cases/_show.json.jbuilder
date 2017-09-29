# frozen_string_literal: true

json.key_format! camelize: :lower

json.cache! c do
  json.partial! 'case', c: c

  json.extract! c, :summary, :other_available_locales, :commentable,
                :learning_objectives, :audience

  json.case_elements c.case_elements do |case_element|
    json.cache! case_element do
      json.partial! case_element
    end
  end
end

by_id json,
      pages: c.pages,
      cards: c.cards,
      edgenotes: c.edgenotes,
      podcasts: c.podcasts,
      activities: c.activities

if reader_signed_in?
  if current_user.has_cached_role?(:editor)
    json.statistics do
      json.keep true
    end
  else
    json.statistics false
  end

  json.reader do
    json.partial! current_reader
    json.can_update_case current_reader.can_update? c
    json.enrollment @enrollment
  end

  json.quiz do
    quiz = @deployment.quiz
    json.needs_pretest @deployment.reader_needs_pretest? current_reader
    json.needs_posttest @deployment.reader_needs_posttest? current_reader
    if quiz && quiz.requires_response_from?(current_reader, in_group: @group)
      json.id quiz.id
      json.questions do
        json.array! quiz.questions, :id, :content, :options
      end
    end
  end

  if current_reader.can_update? c
    json.enrollments do
      Enrollment.statuses.each do |status, _num|
        json.set! status, c.enrollments.select(&:"#{status}?")
      end
    end
  end
else
  json.sign_in_form render(partial: 'devise/sessions/sign_in',
                           formats: [:html],
                           locals: { resource: Reader.new })
end
