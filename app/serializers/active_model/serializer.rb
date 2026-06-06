# frozen_string_literal: true

module ActiveModel
  class Serializer
    Attribute = Struct.new(:name, :key, :if_condition, :unless_condition, :block, keyword_init: true)
    Association = Struct.new(
      :name,
      :key,
      :serializer,
      :collection,
      :if_condition,
      :unless_condition,
      :block,
      keyword_init: true
    )
    Link = Struct.new(:name, :block, keyword_init: true)

    class << self
      def inherited(child)
        super
        child._attributes = _attributes.dup
        child._associations = _associations.dup
        child._links = _links.dup
      end

      def attributes(*names)
        names.each { |name| attribute(name) }
      end

      def attribute(name, key: nil, if: nil, unless: nil, &block)
        _attributes << Attribute.new(
          name: name,
          key: key || name,
          if_condition: binding.local_variable_get(:if),
          unless_condition: binding.local_variable_get(:unless),
          block: block
        )
      end

      def has_many(name, key: nil, serializer: nil, if: nil, unless: nil, &block)
        _associations << Association.new(
          name: name,
          key: key || name,
          serializer: serializer,
          collection: true,
          if_condition: binding.local_variable_get(:if),
          unless_condition: binding.local_variable_get(:unless),
          block: block
        )
      end

      def has_one(name, key: nil, serializer: nil, if: nil, unless: nil, &block)
        _associations << Association.new(
          name: name,
          key: key || name,
          serializer: serializer,
          collection: false,
          if_condition: binding.local_variable_get(:if),
          unless_condition: binding.local_variable_get(:unless),
          block: block
        )
      end

      alias belongs_to has_one

      def link(name, &block)
        _links[name] = Link.new(name: name, block: block)
      end

      def for(resource, **options)
        FastJson.build_serializer(resource, **options)
      end

      attr_writer :_attributes, :_associations, :_links

      def _attributes
        @_attributes ||= []
      end

      def _associations
        @_associations ||= []
      end

      def _links
        @_links ||= {}
      end
    end

    attr_accessor :object
    attr_reader :instance_options, :scope, :scope_name, :view_context

    def initialize(object, options = {})
      @object = object
      @instance_options = options
      @scope = options[:scope] || options[:view_context]
      @scope_name = options[:scope_name] || (:view_context if options[:view_context])
      @view_context = options[:view_context] || (@scope if @scope_name == :view_context)
    end

    def as_json(_options = nil)
      FastJson.transform_keys(serializable_hash)
    end

    def serializable_hash
      attributes_hash.merge(associations_hash)
    end

    def to_json(*_args)
      FastJson.dump(as_json)
    end

    def _links
      self.class._links
    end

    private

    def attributes_hash
      self.class._attributes.each_with_object({}) do |attribute, hash|
        next unless include_member?(attribute)

        hash[attribute.key] = read_attribute(attribute)
      end
    end

    def associations_hash
      self.class._associations.each_with_object({}) do |association, hash|
        next unless include_member?(association)

        hash[association.key] = read_association(association)
      end
    end

    def read_attribute(attribute)
      if attribute.block
        instance_exec(&attribute.block)
      elsif respond_to?(attribute.name)
        public_send(attribute.name)
      else
        object.public_send(attribute.name)
      end
    end

    def read_association(association)
      if association.block
        instance_exec(self, &association.block)
      else
        value = object.public_send(association.name)
        return serialize_collection_association(value, association) if association.collection

        FastJson.serialize_value(
          value,
          serializer: association.serializer,
          namespace: self.class,
          **instance_options
        )
      end
    end

    def include_member?(member)
      return false if member.if_condition && !condition_matches?(member.if_condition)
      return false if member.unless_condition && condition_matches?(member.unless_condition)

      true
    end

    def condition_matches?(condition)
      case condition
      when Symbol, String
        public_send(condition)
      else
        condition.arity.zero? ? instance_exec(&condition) : condition.call(self)
      end
    end

    def serialize_collection_association(value, association)
      value.to_a.map do |item|
        FastJson.serialize_value(
          item,
          serializer: association.serializer,
          namespace: self.class,
          **instance_options
        )
      end
    end
  end
end
