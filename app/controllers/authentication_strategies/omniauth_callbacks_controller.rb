class AuthenticationStrategies::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  before_action :set_authentication_strategy, except: [:failure]
  before_action :set_case, only: [:lti]

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
      sign_in @authentication_strategy.reader
      enroll_reader_in_case if @case
      redirect_to redirect_url
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

  def set_case
    @case = Case.find_by_slug params[:case_slug]
  end

  def enroll_reader_in_case
    Enrollment.upsert reader_id: @authentication_strategy.reader.id,
      case_id: @case.id,
      status: Enrollment.status_from_lti_role(params[:ext_roles])
  end

  def redirect_url
    if @case
      case_url @case
    else
      root_path
    end
  end

end
