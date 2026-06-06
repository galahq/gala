# frozen_string_literal: true

require Rails.root.join('app/lib/gala/pundit_query_watch')

Pundit.singleton_class.prepend(Gala::PunditQueryWatch::PunditMethods)

ActiveSupport.on_load(:action_controller_base) do
  include Gala::PunditQueryWatch::ControllerHooks
end
