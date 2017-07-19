# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! c, :slug, :published, :kicker, :title, :dek, :case_authors,
              :summary, :tags, :photo_credit, :other_available_locales,
              :commentable, :learning_objectives, :audience

json.base_cover_url c.cover_url
json.small_cover_url ix_cover_image(c, :small)
json.cover_url ix_cover_image(c, :billboard)
json.translators translators_string c

json.page_ids c.pages.map(&:id)
json.case_elements c.case_elements do |case_element|
  json.partial! case_element
end

by_id json,
      pages: c.pages,
      cards: c.cards,
      edgenotes: c.edgenotes,
      podcasts: c.podcasts,
      activities: c.activities

if reader_signed_in?
  if c.commentable
    by_id json,
          comment_threads: c.comment_threads
                            .select { |x| x.visible_to_reader? current_reader },
          comments: c.comments
  end

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
    json.enrollment current_reader.enrollment_for_case(c)
    if @group.active?
      json.active_group do
        json.extract! @group, :id, :name
      end
    end
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
