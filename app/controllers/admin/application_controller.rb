# frozen_string_literal: true

# All Administrate controllers inherit from this `Admin::ApplicationController`,
# making it the ideal place to put authentication logic or other
# before_actions.
#
# If you want to add pagination or other controller-level concerns,
# you're free to overwrite the RESTful controller actions.
module Admin
  class ApplicationController < Administrate::ApplicationController
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
      disabled_actions.exclude?(name.to_s) && super
    end

    def disabled_actions
      %w[new edit destroy]
    end
  end
end
