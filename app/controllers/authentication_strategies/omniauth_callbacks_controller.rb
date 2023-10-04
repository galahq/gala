# frozen_string_literal: true

module AuthenticationStrategies
  # Handle successful OAuth authentication
  class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    include AfterSignInPath
    include MagicLink
    include CleanupLocks

    skip_before_action :verify_authenticity_token
    before_action :set_authentication_strategy, except: [:failure]
    before_action :set_reader, except: [:failure]

    # @route [GET, POST] `/authentication_strategies/auth/google/callback`
    def google
      if @authentication_strategy.persisted?
        sign_in @reader
        enqueue_cleanup_locks_job
        link_reader if following_magic_link?
        redirect_to after_sign_in_path_for @reader
      else
        session['devise.google_data'] = request.env['omniauth.auth']
                                               .except(:extra)
        render 'devise/registrations/new', layout: 'window'
      end
    end

    # @route [GET, POST] `/authentication_strategies/auth/lti/callback`
    def lti # rubocop:disable Metrics/AbcSize
      if @authentication_strategy.persisted?
        sign_in @reader
        enqueue_cleanup_locks_job

        linker = LinkerService.new LinkerService::LTIStrategy.new params
        linker.call

        redirect_to linker.kase || root_path
      else
        session['devise.lti_data'] = request.env['omniauth.auth']
        render 'devise/registrations/new', layout: 'window'
      end
    end

    def failure
      redirect_to root_path
    end

    private

    def set_authentication_strategy
      @authentication_strategy = AuthenticationStrategy.from_omniauth(
        request.env['omniauth.auth']
      )
    end

    def set_reader
      @reader = @authentication_strategy.reader
    end
  end
end
