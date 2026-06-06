# frozen_string_literal: true

require 'json'

module FastJson
  module_function

  def dump(value)
    JSON.generate(as_json(value))
  end

  def as_json(value)
    case value
    when ActiveModel::Serializer
      value.as_json
    when Array
      value.map { |item| as_json(item) }
    when Hash
      value.transform_values { |item| as_json(item) }
    else
      value.respond_to?(:as_json) ? value.as_json : value
    end
  end

  def serialize(value, **options)
    serializer = options.delete(:serializer)
    each_serializer = options.delete(:each_serializer)
    root = options.delete(:root)
    data = serialize_value(value, serializer: serializer, each_serializer: each_serializer, **options)

    root.present? ? { root => data } : data
  end

  def build_serializer(resource, serializer: nil, each_serializer: nil, **options)
    if collection?(resource)
      SerializableCollection.new(resource, serializer: each_serializer || serializer, options: options)
    else
      serializer_class = serializer || serializer_for(resource)
      return nil unless serializer_class

      serializer_class.new(resource, options)
    end
  end

  def serialize_value(value, serializer: nil, each_serializer: nil, namespace: nil, **options)
    return nil if value.nil?

    if collection?(value)
      serializer_class = each_serializer || serializer
      return value.map { |item| serialize_value(item, serializer: serializer_class, namespace: namespace, **options) }
    end

    serializer_class = serializer || serializer_for(value, namespace: namespace)
    return serializer_class.new(value, options).as_json if serializer_class

    as_json(value)
  end

  def serializer_for(value, namespace: nil)
    serializer_name = serializer_name_for(value)
    return unless serializer_name

    if namespace && namespace.const_defined?(serializer_name, false)
      return namespace.const_get(serializer_name, false)
    end

    serializer_name.safe_constantize
  end

  def serializer_name_for(value)
    model_name =
      if value.respond_to?(:model_name)
        value.model_name.name
      elsif value.respond_to?(:object) && value.object.respond_to?(:model_name)
        value.object.model_name.name
      elsif value.class.respond_to?(:model_name)
        value.class.model_name.name
      end

    model_name ||= value.class.name
    return if model_name.blank?

    "#{model_name}Serializer"
  end

  def collection?(value)
    return false if value.is_a?(String) || value.is_a?(Hash)
    return true if value.is_a?(Array)
    return true if defined?(ActiveRecord::Relation) && value.is_a?(ActiveRecord::Relation)
    return true if defined?(Draper::CollectionDecorator) && value.is_a?(Draper::CollectionDecorator)

    false
  end

  def transform_keys(value)
    if defined?(ApplicationSerializer::UntransformableHash) &&
       value.is_a?(ApplicationSerializer::UntransformableHash)
      value.to_h
    else
      transform_keyed_value(value)
    end
  end

  def transform_keyed_value(value)
    case value
    when Array
      value.map { |item| transform_keys(item) }
    when Hash
      value.each_with_object({}) do |(key, item), hash|
        hash[camel_lower(key)] = transform_keys(item)
      end
    else
      value
    end
  end

  def camel_lower(key)
    key.to_s.camelize(:lower)
  end

  class SerializableCollection
    def initialize(collection, serializer:, options:)
      @collection = collection
      @serializer = serializer
      @options = options
    end

    def as_json(_options = nil)
      @collection.map do |item|
        FastJson.serialize_value(item, serializer: @serializer, **@options)
      end
    end

    def to_json(*_args)
      FastJson.dump(as_json)
    end
  end
end
