# frozen_string_literal: true

ActiveModelSerializers.config.key_transform = :camel_lower

ActiveModelSerializers.logger = Logger.new(IO::NULL)

ActiveModel::Serializer.class_eval do
  def self.for(resource, serializer: nil, view_context: nil, **options)
    options[:serializer] = serializer if serializer
    options[:scope] = view_context if view_context
    options[:scope_name] = :view_context
    ActiveModelSerializers::SerializableResource.new(resource, options)
  end
end
