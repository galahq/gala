# frozen_string_literal: true

ActiveModelSerializers.config.key_transform = :camel_lower

ActiveSupport::Notifications.unsubscribe(
  ActiveModelSerializers::Logging::RENDER_EVENT
)
