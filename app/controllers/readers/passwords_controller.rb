# frozen_string_literal: true

module Readers
  # Handles password reset requests
  class PasswordsController < Devise::PasswordsController
    layout 'window'

    # @route [POST] `/resource/password`
    def create
      # Get email from params - Devise uses params[:reader][:email] for the readers scope
      email = params.dig(:reader, :email) || params.dig('reader', 'email')
      
      if email.present?
        reader = Reader.find_by(email: email)
        
        # Check if user signed in with Google and doesn't have a password set
        if reader && reader.providers.include?('google') && reader.encrypted_password.blank?
          # User signed in with Google and never created a password
          self.resource = resource_class.new(email: email)
          resource.errors.add(:email, :google_oauth_user)
          respond_with(resource)
          return
        end
      end
      
      # Continue with normal Devise password reset flow
      super
    end
  end
end

