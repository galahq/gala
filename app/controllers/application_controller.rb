# frozen_string_literal: true

require 'sieve'

# Base controller for actions to run on every request
# @abstract
class ApplicationController < ActionController::Base
  include TranslatedFlashMessages
  include Omniauth::Lti::Context
  include Pundit

  before_action :store_current_location, unless: :devise_controller?
  before_action :set_locale

  delegate :successful?, to: :response

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  serialization_scope :view_context

  # All url helpers use this: keep users in their active locale after it’s set.
  def default_url_options(options = {})
    options[:locale] = params[:locale]
    options
  end

  private

  def user_not_authorized
    respond_to do |format|
      format.html do
        flash[:alert] =
          I18n.t 'pundit.not_authorized'
        redirect_to not_authorized_redirect_path
      end
      format.json do
        head :forbidden
      end
    end
  end

  def not_authorized_redirect_path
    reader_signed_in? ? root_path : new_reader_session_path
  end

  def set_locale
    if params[:locale]
      I18n.locale = params[:locale]
    elsif reader_signed_in? && !current_reader.locale.blank?
      I18n.locale = current_reader.locale
    else
      I18n.locale = http_accept_language
                    .compatible_language_from I18n.available_locales
    end
  end

  def validate_lti_request!
    redirect_to root_path unless lti_request_valid?
  end

  def lti_request_valid?
    provider = IMS::LTI::ToolProvider.new ENV['LTI_KEY'], ENV['LTI_SECRET'],
                                          request.request_parameters
    provider.valid_request? request
  end

  def current_user
    current_reader || AnonymousUser.new
  end

  def store_current_location
    store_location_for(:user, request.url) if request.format == :html
  end

  def after_sign_in_path_for(resource_or_scope)
    path = request.env['omniauth.origin']
    path ||= stored_location_for(resource_or_scope)
    path || signed_in_root_path(resource_or_scope)
  end

  def authority_forbidden(_error)
    render file: Rails.root.join('public', '403.html'),
           status: 403, layout: false
  end

  def download_as(filename, type = nil)
    headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
    headers['Content-Type'] ||= type
  end
end
