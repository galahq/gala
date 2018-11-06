# frozen_string_literal: true

# Helpers for dealing with ContentItemSelectionParams which live in the session
# during the process of a Canvas deployment
module SelectionParams
  extend ActiveSupport::Concern

  included do
    helper_method :selection_params
  end

  private

  def selection_params
    session[:content_item_selection_params]
  end

  def selection_params=(data)
    session[:content_item_selection_params] = data
  end

  def lti_uid
    selection_params.try :[], 'lti_uid'
  end

  def pundit_user
    DeploymentPolicy::UserContext.new current_user, selection_params
  end

  def ensure_content_item_selection_params_set!
    redirect_to root_url unless selection_params.present?
  end

  def clear_content_item_selection_params
    session[:content_item_selection_params] = nil
  end
end
