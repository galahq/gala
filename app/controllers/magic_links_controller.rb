# frozen_string_literal: true

# A magic link is an alternative to an LTI launch which allows professors to
# give their students easy access to the case with their selected pre/post
# assessment attached. Following a magic link containing a random and unique
# deployment parameter, the student can enroll in a case with an account she
# already has, or create a new account.
#
# ### Code pathways for the magic link
# - **User is logged in**: {MagicLinksController#show} →
#   {MagicLinksController#create} → {CasesController#show}
# - **User has an account but is logged out**: {MagicLinksController#show} →
#   {MagicLinksController#create} → {Readers::RegistrationsController#new} →
#   {Readers::SessionsController#new} → {Readers::SessionsController#create} →
#   {CasesController#show}
# - **User does not have an account**: {MagicLinksController#show} →
#   {MagicLinksController#create} → {Readers::RegistrationsController#new} →
#   {Readers::RegistrationsController#create} →
#   {Readers::ConfirmationsController#create} → {CasesController#show}
class MagicLinksController < ApplicationController
  include MagicLink

  decorates_assigned :deployment

  # @route [GET] `/magic_link?key=ABCDEF`
  def show
    redirect_to root_path and return unless params['key'].present?

    @deployment = Deployment.find_by_key params['key']

    if @deployment
      render layout: 'window'
    else
      redirect_to root_path
    end
  end

  # @route [POST] `/magic_link?key=ABCDEF`
  def create
    save_deployment_in_session
    link_reader
    redirect_to after_linking_redirect_path
  end
end
