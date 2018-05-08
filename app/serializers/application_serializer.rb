# frozen_string_literal: true

# @abstract
class ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  # Wrapper for a hash that disables key transformations
  class UntransformableHash
    delegate_missing_to :@hash

    def initialize(hash = {})
      @hash = hash
    end

    def deep_transform_keys!
      self
    end
  end

  attribute :links, if: -> { _links.any? } do
    _links.transform_values do |value|
      value unless value.respond_to? :call
      instance_eval(&value)
    end
  end

  delegate :render, :reader_signed_in?, :current_user, to: :view_context

  def self.has_many_by_id(relation, options = {})
    has_many relation do |serializer|
      serializer.by_id object.send(relation), options
    end
  end

  def by_id(collection, options = {})
    collection.each_with_object(UntransformableHash.new) do |element, hash|
      hash[element.to_param.freeze] =
        ActiveModel::Serializer.for(element, options).as_json
    end
  end
end
