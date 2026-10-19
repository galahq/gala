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
  before_action :set_sentry_context
  before_action :require_open_account, if: :reader_signed_in?
  before_action :confirm_tos,
                if: :reader_signed_in?,
                unless: :devise_controller?

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
    current_reader || AnonymousUser.new
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

  # Identify the reader to Sentry by id, not email. The id gives every
  # debugging property the email did (group by user, spot repeat hits)
  # without sending the address to a third party; look it up at
  # /admin/readers/:id if you need to contact them.
  #
  # Nothing else is attached. The old `set_extras(params: params.to_unsafe_h,
  # url: request.url)` bypassed `filter_parameters` and, because this runs on
  # every request including Devise's, shipped the password on sign-in errors
  # and the raw reset/confirmation token from the query string on any error
  # during those requests. The SDK's own request interface already carries
  # the path, method, headers and request_id, and with send_default_pii off
  # it drops the query string itself.
  def set_sentry_context
    return unless defined?(Sentry)
    return unless reader_signed_in?

    Sentry.configure_scope { |scope| scope.set_user(id: current_reader.id) }
  end

  # A closed reader can sign in by any route, but until they restore the
  # account they can use nothing except the restore page, sign-out, and the
  # Devise password and confirmation screens they may need to get back in
  # (grace-state rules W4 to W6). Existing sessions hit this on their next
  # request. Without it they could keep using the account for 30 days and the
  # sweep would scrub an account in active use.
  def require_open_account
    return unless current_reader.closed?
    return if closed_reader_allowed_here?

    respond_to do |format|
      format.html { redirect_to account_restoration_path }
      format.any { head :forbidden }
    end
  end

  # The OmniAuth callbacks are here so another reader can sign in over a
  # closed reader's session on a shared computer; a closed reader signing in
  # that way is sent to the restore page by the callback itself.
  def closed_reader_allowed_here?
    is_a?(AccountRestorationsController) ||
      is_a?(Devise::OmniauthCallbacksController) ||
      is_a?(Devise::SessionsController) ||
      is_a?(Devise::PasswordsController) ||
      is_a?(Devise::ConfirmationsController)
  end

  def confirm_tos
    return if current_reader&.closed?
    return if current_user.terms_of_service.to_i >=
              Rails.application.config.current_terms_of_service

    session[:forwarding_url] = session.delete(:user_return_to)
    redirect_to edit_tos_reader_path(current_user),
                alert: t('readers.edit_tos.must_accept')
  end
end
