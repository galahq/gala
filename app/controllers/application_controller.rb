class ApplicationController < ActionController::Base
  before_action :set_locale

  def default_url_options(options = {})
    options[:locale] = params[:locale]
    options
  end

  private

  def set_locale
    if params[:locale]
      I18n.locale = params[:locale]
    else
      logger.debug "User preferred languages: #{http_accept_language.user_preferred_languages}"
      I18n.locale = http_accept_language.compatible_language_from I18n.available_locales
      logger.debug "Locale set to #{I18n.locale}"
    end
  end

  def authenticate_reader_from_token!
    reader_email = params[:reader_email].presence
    reader = reader_email && Reader.find_by_email(reader_email)
    if reader && Devise.secure_compare(reader.authentication_token, params[:reader_token])
      sign_in reader, store: false
    end
  end

end
