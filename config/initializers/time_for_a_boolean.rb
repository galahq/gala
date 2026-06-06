# frozen_string_literal: true

require Rails.root.join('vendor', 'ruby', 'time_for_a_boolean')

ActiveSupport.on_load(:active_record) do
  extend TimeForABoolean
end
