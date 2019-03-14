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
      instance_eval(&value.block)
    end
  end

  attribute(:type) { object.model_name.name }
  attribute(:table) { object.model_name.plural }
  attribute(:param) { object.to_param }

  def self.has_many_by_id(relation, options = {})
    has_many relation do |serializer|
      serializer.by_id object.send(relation), options
    end
  end

  def by_id(collection, options = {})
    collection.each_with_object(UntransformableHash.new) do |element, hash|
      hash[element.to_param.freeze] =
        ActiveModel::Serializer
        .for(element, view_context: view_context, **options)
        .as_json
    end
  end

  # view_context must be provided for render to be used
  delegate :render, to: :view_context, allow_nil: true

  def reader_signed_in?
    return false unless view_context.present?

    view_context.reader_signed_in?
  end

  def current_user
    return AnonymousUser.new unless view_context.present?

    view_context.current_user
  end
end
