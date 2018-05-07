# frozen_string_literal: true

ActiveModelSerializers.config.key_transform = :camel_lower

ActiveSupport::Notifications.unsubscribe(
  ActiveModelSerializers::Logging::RENDER_EVENT
)

ActiveModel::Serializer.class_eval do
  def self.for(resource, options = {})
    ActiveModelSerializers::SerializableResource.new(resource, options)
  end
end
