# frozen_string_literal: true

require 'sieve'

# Base controller for actions to run on every request
# @abstract
class ApplicationController < ActionController::Base
  SHOW_SPOTLIGHT_ACKNOWLEDGEMENT_QUERY_PARAM =
    'show_spotlight_acknowledgements'
  SPOTLIGHT_ACKNOWLEDGEMENT_SESSION_KEY =
    :gala_show_spotlight_acknowledgements
  SPOTLIGHT_ACKNOWLEDGEMENT_SESSION_KEY_FOR_READER =
    :gala_show_spotlight_acknowledgements_for_reader

  include TranslatedFlashMessages
  include Omniauth::Lti::Context
  include Pundit

  before_action :set_current
  before_action :store_current_location, unless: :devise_controller?
  before_action :set_locale
  before_action :capture_spotlight_acknowledgement_launch_state
  before_action :confirm_tos,
                if: :reader_signed_in?,
                unless: :devise_controller?

  delegate :successful?, to: :response

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # All url helpers use this: keep users in their active locale after it’s set.
  def default_url_options(options = {})
    options[:locale] = params[:locale]
    options
  end

  def spotlight_acknowledgements_on_first_login?
    @spotlight_acknowledgements_on_first_login ||= false
  end
  helper_method :spotlight_acknowledgements_on_first_login?

  private

  def capture_spotlight_acknowledgement_launch_state
    remember_spotlight_acknowledgement_launch_state
    @spotlight_acknowledgements_on_first_login =
      consume_spotlight_acknowledgement_launch_state
  end

  def remember_spotlight_acknowledgement_launch_state
    return unless spotlight_acknowledgement_launch_requested?
    return unless reader_signed_in?
    return unless current_reader.sign_in_count == 1
    return if
      session[SPOTLIGHT_ACKNOWLEDGEMENT_SESSION_KEY_FOR_READER] ==
      current_reader.id

    session[SPOTLIGHT_ACKNOWLEDGEMENT_SESSION_KEY] = true
    session[SPOTLIGHT_ACKNOWLEDGEMENT_SESSION_KEY_FOR_READER] =
      current_reader.id
  end

  def consume_spotlight_acknowledgement_launch_state
    return false unless reader_signed_in?
    return false unless current_reader.sign_in_count == 1

    session.delete(SPOTLIGHT_ACKNOWLEDGEMENT_SESSION_KEY) == true
  end

  def spotlight_acknowledgement_launch_requested?
    %w[1 true].include?(
      params[SHOW_SPOTLIGHT_ACKNOWLEDGEMENT_QUERY_PARAM]
        .to_s
        .downcase
    )
  end

  def user_not_authorized
    respond_to do |format|
      format.html do
        redirect_to not_authorized_redirect_path
      end
      format.json do
        head :forbidden
      end
    end
  end

  def not_authorized_redirect_path
    reader_signed_in? ? '/403' : new_reader_session_path
  end

  def set_locale
    I18n.locale = if params[:locale]
                    params[:locale]
                  elsif reader_signed_in? && !current_reader.locale.blank?
                    current_reader.locale
                  else
                    http_accept_language
                      .compatible_language_from I18n.available_locales
                  end
  rescue I18n::InvalidLocale
    I18n.locale = :en
  end

  def validate_lti_request!
    return if lti_request_valid?

    Rails.logger.info 'Invalid LTI request'
    redirect_to root_path
  end

  def lti_request_valid?
    provider = IMS::LTI::ToolProvider.new ENV['LTI_KEY'], ENV['LTI_SECRET'],
                                          request.request_parameters
    provider.valid_request? request
  end

  def current_user
    Current.user || current_reader || AnonymousUser.new
  rescue Devise::MissingWarden
    AnonymousUser.new
  end

  def set_current
    Current.reader = current_reader if reader_signed_in?
    Current.user = Current.reader || AnonymousUser.new
  end

  def store_current_location
    store_location_for(:user, request.url) if request.format == :html
  end

  def authority_forbidden(_error)
    render file: Rails.root.join('public', '403.html'),
           status: 403, layout: false
  end

  def download_as(filename, type = nil)
    headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
    headers['Content-Type'] ||= type
  end

  def confirm_tos
    return if current_user.terms_of_service.to_i >=
              Rails.application.config.current_terms_of_service
    session[:forwarding_url] = session.delete(:user_return_to)
    redirect_to edit_tos_reader_path(current_user),
                alert: t('readers.edit_tos.must_accept')
  end
end
