# frozen_string_literal: true

# An abstract base class for all decorators to inherit from
class ApplicationDecorator < Draper::Decorator
  include Rails.application.routes.url_helpers

  delegate_all

  def serializer_class
    "#{object.class.name}Serializer".constantize
  end
end
