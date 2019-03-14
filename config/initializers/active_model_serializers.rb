# frozen_string_literal: true

ActiveModelSerializers.config.key_transform = :camel_lower

ActiveModelSerializers.logger = Logger.new(IO::NULL)

ActiveModel::Serializer.class_eval do
  def self.for(resource, view_context: nil, **kwargs)
    options = { scope: view_context, scope_name: :view_context }.merge(kwargs)
    ActiveModelSerializers::SerializableResource.new(resource, options)
  end
end
