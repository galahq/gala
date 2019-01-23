# frozen_string_literal: true

module Readers
  # Serialize the bits you need for an identicon
  class IdenticonSerializer < ApplicationSerializer
    attributes :id, :image_url, :hash_key, :name

    def initialize(*props)
      super(*props)
      self.object = object.decorate
    end
  end
end
