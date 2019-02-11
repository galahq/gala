module Admin
  class Ahoy::EventsController < Admin::ApplicationController
    def scoped_resource
      resource_class.order(time: :desc)
    end
  end
end
