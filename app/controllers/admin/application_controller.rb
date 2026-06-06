# frozen_string_literal: true

# All Administrate controllers inherit from this `Admin::ApplicationController`,
# making it the ideal place to put authentication logic or other
# before_actions.
#
# If you want to add pagination or other controller-level concerns,
# you're free to overwrite the RESTful controller actions.
module Admin
  class ApplicationController < Administrate::ApplicationController
    helper_method :valid_action?
    helper_method :show_action?

    before_action :authenticate_reader!, except: %i[index show]
    before_action :authorize_admin

    def authorize_admin
      redirect_to '/403' unless current_reader&.has_role?(:editor)
    end

    # Override this value to specify the number of elements to display at a time
    # on index pages. Defaults to 20.
    # def records_per_page
    #   params[:per_page] || 20
    # end

    def namespace
      super.to_sym
    end

    # Disable new, edit, and destroy actions
    def valid_action?(name, resource = resource_class)
      action_name = name.to_s
      return false if disabled_actions.include?(action_name)

      resource_controller = controller_for_resource(resource)
      resource_controller.action_methods.include?(action_name)
    end

    def show_action?(name, resource = resource_class)
      valid_action?(name, resource)
    end

    def disabled_actions
      %w[new edit destroy]
    end

    private

    def controller_for_resource(resource)
      return self.class unless resource

      controller_name = resource.to_s.pluralize.camelize
      "Admin::#{controller_name}Controller".safe_constantize || self.class
    end
  end
end
