class ApplicationController < ActionController::API
  private
  def authenticate_reader_from_token!
    reader_email = params[:reader_email].presence
    reader = reader_email && Reader.find_by_email(reader_email)
    if reader && Devise.secure_compare(reader.authentication_token, params[:reader_token])
      sign_in reader, store: false
    end
  end

end
