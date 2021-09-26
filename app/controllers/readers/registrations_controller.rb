# frozen_string_literal: true

module Readers
  # Handles new account creation
  class RegistrationsController < Devise::RegistrationsController
    include MagicLink
    before_action :configure_sign_up_params, only: [:create]
    # before_action :configure_account_update_params, only: [:update]

    layout 'window'

    # @method new
    # @route [GET] `/resource/sign_up`
    # ```
    # def new
    #   super
    # end
    # ```

    # @route [POST] `/resource`
    def create
      super do |reader|
        link_reader! reader if reader.persisted? && following_magic_link?
      end
    end

    # @method edit
    # @route [GET] `/resource/edit`
    # ```
    # def edit
    #   super
    # end
    # ```

    # @method update
    # @route [PUT] `/resource`
    # ```
    # def update
    #   super
    # end
    # ```

    # @method destroy
    # @route [DELETE] `/resource`
    # ```
    # def destroy
    #   super
    # end
    # ```

    # @method cancel
    # @route [GET] `/resource/cancel`
    # Forces the session data which is usually expired after sign
    # in to be expired now. This is useful if the user wants to
    # cancel oauth signing in/up in the middle of the process,
    # removing all OAuth session data.
    # ```
    # def cancel
    #   super
    # end
    # ```

    # protected

    # If you have extra params to permit, append them to the sanitizer.
    def configure_sign_up_params
      devise_parameter_sanitizer.permit(:sign_up,
                                        keys: %i[name initials locale terms_of_service])
    end

    # If you have extra params to permit, append them to the sanitizer.
    def configure_account_update_params
      devise_parameter_sanitizer.permit(:account_update,
                                        keys: %i[name initials locale])
    end

    # The path used after sign up.
    # def after_sign_up_path_for(resource)
    #   super(resource)
    # end

    # The path used after sign up for inactive accounts.
    # def after_inactive_sign_up_path_for(resource)
    #   super(resource)
    # end
  end
end
