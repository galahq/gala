# frozen_string_literal: true

# The persona is the user’s declared primary reason for using Gala.
class PersonasController < ApplicationController
  skip_before_action :store_current_location
  before_action :authenticate_reader!

  layout 'admin'

  # Part of the onboarding flow: after a user creates an account, we ask them to
  # choose a persona.
  #
  # @route [GET] `/profile/persona/edit`
  def edit
    @reader = current_reader
  end

  # Save the user’s persona and redirect them where they need to go.
  #
  # @route [PUT] `/profile/persona`
  def update
    current_reader.update persona: params[:persona]

    if current_reader.persona == 'teacher' || current_reader.persona == 'writer'
      invite_reader_to_caselog(current_reader)
    end

    redirect_to after_set_persona_path
  end

  private

  def after_set_persona_path
    stored_location_for(:user) || root_path
  end

  def invite_reader_to_caselog(reader)
    reader.add_role :instructor
  end
end
