class Readers::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  before_action :set_reader, except: [:failure]

  def facebook
    if @reader.persisted?
      sign_in_and_redirect @reader, event: :authentication
    else
      session["devise.omniauth"] = request.env["omniauth.auth"]
      redirect_to new_reader_registration_url
    end
  end

  def google
    if @reader.persisted?
      sign_in_and_redirect @reader, event: :authentication
    else
      session["devise.google_data"] = request.env["omniauth.auth"].except(:extra)
      render 'devise/registrations/new'
    end
  end

  def lti
    if @reader.persisted?
      sign_in_and_redirect @reader, event: :authentication
    else
      session["devise.lti_data"] = request.env["omniauth.auth"]
      redirect_to new_reader_registration_url
    end
  end

  def failure
    redirect_to root_path
  end

  private
  def set_reader
    @reader = Reader.from_omniauth(request.env["omniauth.auth"])
  end

end
