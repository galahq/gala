# frozen_string_literal: true

# @see SpotlightAcknowledgement
class SpotlightAcknowledgementsController < ApplicationController
  before_action :authenticate_reader!

  # @route [POST] `/spotlight_acknowledgements`
  def create
    acknowledgement = SpotlightAcknowledgement.new(acknowledgement_params)
    acknowledgement.reader = current_reader
    acknowledgement.save

    head :created
  end

  private

  def acknowledgement_params
    params.require(:spotlight_acknowledgement).permit(:spotlight_key)
  end
end
