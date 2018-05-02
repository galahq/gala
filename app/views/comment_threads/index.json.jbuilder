# frozen_string_literal: true

json.key_format! camelize: :lower

json.most_recent_comment_threads @comment_threads.reorder(updated_at: :desc).pluck(:id).uniq

by_id json,
      comment_threads: @comment_threads,
      comments: @comment_threads.flat_map(&:comments)

json.cards do
  @case.cards.each do |card|
    json.cache! [I18n.locale, card, @forum, current_reader] do
      json.set! card.to_param do
        json.extract! card, :id, :page_id, :position, :solid, :raw_content
        json.page_id card.element_type == 'Page' ? card.element_id : nil
        json.content card.content || ''
        json.comment_threads threads_for_card(@comment_threads, card.id) do |ct|
          json.cache! ct do
            json.partial! ct
          end
        end
      end
    end
  end
end
