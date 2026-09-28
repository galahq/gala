# frozen_string_literal: true

module Readers
  # Serialize the bits you need for an identicon
  class IdenticonSerializer < ApplicationSerializer
    attributes :id, :image_url, :hash_key, :name

    # `comments` and `comment_threads` are `dependent: :nullify`, so a comment
    # can outlive its reader with a nil `reader_id`. Decorating unconditionally
    # turned that into a NoMethodError that took down the whole forum thread
    # for every other participant, not just the departed reader's own comment.
    def initialize(*props)
      super(*props)
      self.object = object&.decorate
    end
  end
end
