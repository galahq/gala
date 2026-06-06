# frozen_string_literal: true

require Rails.root.join('app/serializers/fast_json')
require Rails.root.join('app/serializers/active_model/serializer')

ActionController::Renderers.add :json do |json, options|
  status = options.delete(:status)
  content_type = options.delete(:content_type) || Mime[:json]
  renderer_current_user = Current.user
  renderer_current_user ||= begin
    current_user if respond_to?(:current_user)
  rescue Devise::MissingWarden
    nil
  end
  payload = FastJson.serialize(
    json,
    view_context: view_context,
    current_user: renderer_current_user,
    **options
  )

  self.content_type = content_type if media_type.nil?
  self.status = status if status
  self.response_body = FastJson.dump(payload)
end
