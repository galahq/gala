class AuthenticationStrategies::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  before_action :set_authentication_strategy, except: [:failure]

  def google
    if @authentication_strategy.persisted?
      sign_in_and_redirect @authentication_strategy.reader, event: :authentication
    else
      session["devise.google_data"] = request.env["omniauth.auth"].except(:extra)
      render 'devise/registrations/new', layout: "window"
    end
  end

  def lti
    if @authentication_strategy.persisted?
      sign_in_and_redirect @authentication_strategy.reader, event: :authentication
    else
      session["devise.lti_data"] = request.env["omniauth.auth"]
      render 'devise/registrations/new', layout: "window"
    end
  end

  def failure
    redirect_to root_path
  end

  private
  def set_authentication_strategy
    @authentication_strategy = AuthenticationStrategy.from_omniauth(request.env["omniauth.auth"])
  end

end
