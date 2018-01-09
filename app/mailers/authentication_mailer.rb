# frozen_string_literal: true

# Customizations to the emails Devise sends
class AuthenticationMailer < Devise::Mailer
  def devise_mail(record, action, opts = {})
    initialize_from_record(record)
    mail(headers_for(action, opts)) do |format|
      format.text
      format.html
    end
  end
end
