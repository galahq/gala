# frozen_string_literal: true

# Provides logic to determine how to redirect a user who has just signed in
module AfterSignInPath
  private

  def after_sign_in_path_for(user)
    # A user who has followed a magic link should be taken right to their case
    return after_linking_redirect_path if just_linked_user?

    # A user who has just signed in for the first time should follow the
    # onboarding path
    return edit_profile_persona_path if needs_persona_prompt? user

    # A user who just gone through tos confirmation should be taken to
    # where they were going
    forward_url = session.delete('forwarding_url')
    return forward_url if forward_url

    # A user who clicked sign in from a page other than the root should be
    # returned to where they were
    stored_location_for(:user) || root_path
  end

  def needs_persona_prompt?(user)
    user.sign_in_count == 1 && user.persona.blank?
  end
end
