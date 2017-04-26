json.key_format! camelize: :lower
json.extract! c, *%i(slug published kicker title dek case_authors summary tags photo_credit other_available_locales commentable)
json.base_cover_url c.cover_url
json.small_cover_url ix_cover_image(c, :small)
json.cover_url ix_cover_image(c, :billboard)
json.translators translators_string c

json.page_ids c.pages.map(&:id)
json.case_elements c.case_elements do |case_element|
  json.partial! case_element
end

json.pages do
  c.pages.each do |page|
    json.set! page.id do
      json.partial! page
    end
  end
end

json.cards do
  c.cards.each do |card|
    json.set! card.id do
      json.partial! card
    end
  end
end

if c.commentable && current_reader

  json.comment_threads do
    c.comment_threads.select { |x| x.visible_to_reader? current_reader }.each do |comment_thread|
      json.set! comment_thread.id do
        json.partial! comment_thread
      end
    end
  end

  json.comments do
    c.comments.each do |comment|
      json.set! comment.id do
        json.partial! comment
      end
    end
  end

end

if current_user.has_cached_role?(:editor)
  json.statistics do
    json.keep true
  end
else
  json.statistics false
end

json.edgenotes do
  c.edgenotes.each do |edgenote|
    json.set! edgenote.slug do
      json.partial! edgenote
    end
  end
end

json.podcasts do
  c.podcasts.each do |podcast|
    json.set! podcast.id do
      json.partial! podcast
    end
  end
end

json.activities do
  c.activities.each do |activity|
    json.set! activity.id do
      json.partial! activity
    end
  end
end

if reader_signed_in?
  json.reader do
    json.partial! current_reader
    json.can_update_case current_reader.can_update? c
    json.enrollment current_reader.enrollment_for_case(c)
  end

  json.quiz do
    json.needs_pretest @group.deployment_for_case(@case).needs_pretest
    if @quiz.requires_response_from? current_reader
      json.questions do
        json.array! @quiz.questions, :id, :content, :options
      end
    else
    end
  end

  if current_reader.can_update? c
    json.enrollments do
      Enrollment.statuses.each do |status, num|
        json.set! status, c.enrollments.select(&:"#{status}?")
      end
    end
  end
else
  json.sign_in_form (render partial: 'devise/sessions/sign_in', formats: [:html],
                     locals: {resource: Reader.new})
end
