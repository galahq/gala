# frozen_string_literal: true

module CommentThreads
  # All the data needed for the index view
  class IndexSerializer < ApplicationSerializer
    # Include comment thread objects in cards when they’re serialized for
    # comment_threads#index
    class CardSerializer < ::CardSerializer
      attribute(:comment_threads) do
        ActiveModel::Serializer
          .for(instance_options[:threads_by_card_id][object.id])
          .as_json
      end
    end

    attribute :most_recent_comment_threads

    attribute(:comment_threads) { by_id object }
    attribute(:comments) { by_id object.flat_map(&:comments) }

    attribute(:cards) do
      by_id cards, serializer: CardSerializer,
                   threads_by_card_id: object.group_by(&:card_id)
    end

    def most_recent_comment_threads
      object.reorder(updated_at: :desc).pluck(:id).uniq
    end

    def cards
      instance_options[:case].cards
    end
  end
end
