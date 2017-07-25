# frozen_string_literal: true

# Controller methods to handle linking a user to a deployment specified by a
# magic link.
module MagicLink
  SESSION_KEY = 'deployment_key'

  private

  def save_deployment_in_session
    hash = { SESSION_KEY => params[:deployment_key] }
    session.update hash
  end

  def following_magic_link?
    session.key? SESSION_KEY
  end

  def link_reader
    link_reader! if reader_signed_in?
  end

  def after_linking_redirect_path
    if reader_signed_in?
      case_path @linker.kase if @linker
    else
      new_reader_registration_path
    end
  end

  def link_reader!
    strategy = LinkerService::SessionStrategy.new session, current_reader
    @linker = LinkerService.new strategy
    @linker.call
  end
end
