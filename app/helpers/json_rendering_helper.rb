# frozen_string_literal: true

module JsonRenderingHelper
  def json_raw(value, transform_keys: true, **options)
    payload = FastJson.serialize(
      value,
      view_context: self,
      current_user: Current.user || json_current_reader,
      **options
    )
    payload = FastJson.transform_keys(payload) if transform_keys
    raw FastJson.dump(payload)
  end

  private

  def json_current_reader
    current_reader if respond_to?(:current_reader)
  rescue Devise::MissingWarden
    nil
  end
end
