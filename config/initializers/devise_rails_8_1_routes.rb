# frozen_string_literal: true

# Devise 4.9.4 passes its registration route options as a positional hash.
# Rails 8.1 accepts that form but emits keyword-argument deprecations during
# route loading. Keep this override narrow so it can be deleted when Devise 5.0
# ships the upstream fix.
if defined?(Devise::VERSION) && Gem::Version.new(Devise::VERSION) < Gem::Version.new("5.0.0")
  module GalaDeviseRails81Routes
    protected

    def devise_registration(mapping, controllers) # :nodoc:
      path_names = {
        new: mapping.path_names[:sign_up],
        edit: mapping.path_names[:edit],
        cancel: mapping.path_names[:cancel]
      }

      options = {
        only: [:new, :create, :edit, :update, :destroy],
        path: mapping.path_names[:registration],
        path_names: path_names,
        controller: controllers[:registrations]
      }

      resource :registration, **options do
        get :cancel
      end
    end
  end

  ActionDispatch::Routing::Mapper.prepend(GalaDeviseRails81Routes)
end
