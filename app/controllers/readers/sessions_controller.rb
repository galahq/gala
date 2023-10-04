# frozen_string_literal: true

module Readers
  # Handles signing in and signing out
  class SessionsController < Devise::SessionsController
    include AfterSignInPath
    include MagicLink
    include CleanupLocks
    # before_action :configure_sign_in_params, only: [:create]

    respond_to :html, :json, '*/*'

    # @method new
    # @route [GET] `/resource/sign_in`
    # ```
    # def new
    #   super
    # end
    # ```

    # @route [POST] `/resource/sign_in`
    def create
      super do
        enqueue_cleanup_locks_job
        link_reader if following_magic_link?
      end
    end

    # @method destroy
    # @route [DELETE] `/resource/sign_out`
    def destroy
      enqueue_cleanup_locks_job
      super
    end

    protected

    # If you have extra params to permit, append them to the sanitizer.
    # def configure_sign_in_params
    #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
    # end
  end
end
