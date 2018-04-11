# frozen_string_literal: true

# Helpers for dealing with ContentItemSelectionParams which live in the session
# during the process of a Canvas deployment
module SelectionParams
  private

  def selection_params
    session[:content_item_selection_params]
  end

  def lti_uid
    selection_params.try :[], 'lti_uid'
  end

  def pundit_user
    DeploymentPolicy::UserContext.new current_user, selection_params
  end

  def ensure_content_item_selection_params_set!
    redirect_to root_url unless selection_params.present?
    set_selection_params
  end

  def set_selection_params
    @selection_params = selection_params
  end

  def clear_content_item_selection_params
    selection_params = nil
  end
end
