# frozen_string_literal: true

module Readers
  # Serialize the bits you need for an identicon
  class IdenticonSerializer < ApplicationSerializer
    attributes :id, :image_url, :hash_key, :name

    # An unsaved Reader so `type`, `table` and the identicon contract match a
    # real one. The fixed email keeps the hash key, and so the identicon
    # gradient, stable across requests. `id` and `param` serialize as nil, so
    # ownership checks against the current reader fail as they should.
    def self.deleted_reader
      Reader.new(
        name: I18n.t('readers.deleted_name', default: 'Deleted reader'),
        email: 'deleted@gala.invalid'
      )
    end

    # `comments` and `comment_threads` are `dependent: :nullify`, so a comment
    # can outlive its reader with a nil `reader_id`. Decorating unconditionally
    # turned that into a NoMethodError that took down the whole forum thread
    # for every other participant, not just the departed reader's own comment.
    #
    # A nil here becomes a stand-in rather than `null`: the conversation
    # components read `reader.hashKey`, `reader.name` and `reader.id` without
    # guarding, so `null` would move the crash from the server to the browser.
    def initialize(*props)
      super(*props)
      self.object = (object || self.class.deleted_reader).decorate
    end
  end
end
