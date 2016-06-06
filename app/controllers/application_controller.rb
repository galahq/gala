class ApplicationController < ActionController::Base
  before_action :set_locale

  private

  def set_locale
    logger.debug "User preferred languages: #{http_accept_language.user_preferred_languages}"
    I18n.locale = http_accept_language.compatible_language_from I18n.available_locales
    logger.debug "Locale set to #{I18n.locale}"
  end

  def authenticate_reader_from_token!
    reader_email = params[:reader_email].presence
    reader = reader_email && Reader.find_by_email(reader_email)
    if reader && Devise.secure_compare(reader.authentication_token, params[:reader_token])
      sign_in reader, store: false
    end
  end

end
