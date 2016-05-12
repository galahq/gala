class Readers::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  before_filter :set_reader, except: [:failure]

  def facebook
    if @reader.persisted?
      sign_in_and_redirect @reader, event: :authentication
    else
      session["devise.facebook_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end

  def google_oauth2
    if @reader.persisted?
      sign_in_and_redirect @reader, event: :authentication
    else
      session["devise.google_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
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
