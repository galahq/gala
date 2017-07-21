# frozen_string_literal: true

class AuthenticationStrategies::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  before_action :set_authentication_strategy, except: [:failure]
  before_action :set_reader, except: [:failure]

  def google
    if @authentication_strategy.persisted?
      sign_in_and_redirect @reader, event: :authentication
    else
      session['devise.google_data'] = request.env['omniauth.auth'].except(:extra)
      render 'devise/registrations/new', layout: 'window'
    end
  end

  def lti
    if @authentication_strategy.persisted?
      sign_in @reader

      linker = LinkerService.new LinkerService::LTIStrategy.new params
      linker.call

      redirect_to redirect_url
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
    @authentication_strategy = AuthenticationStrategy.from_omniauth(request.env['omniauth.auth'])
  end

  def set_reader
    @reader = @authentication_strategy.reader
  end

  def redirect_url
    if @case
      case_url @case
    else
      root_path
    end
  end
end
