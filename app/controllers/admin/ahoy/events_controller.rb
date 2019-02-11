# frozen_string_literal: true

module Admin
  module Ahoy
    class EventsController < Admin::ApplicationController
      def scoped_resource
        resource_class.order(time: :desc)
      end
    end
  end
end
