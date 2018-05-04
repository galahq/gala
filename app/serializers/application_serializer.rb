# frozen_string_literal: true

# @abstract
class ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  delegate :render, :reader_signed_in?, :current_user, to: :view_context

  def self.has_many_by_id(relation, options = {})
    has_many relation do
      object.send(relation).each_with_object({}) do |element, hash|
        hash[element.to_param] =
          ActiveModelSerializers::SerializableResource.new(element, options)
                                                      .as_json
      end
    end
  end

  attribute :links, if: -> { _links.any? } do
    _links.transform_values do |value|
      value unless value.respond_to? :call
      instance_eval(&value)
    end
  end
end
