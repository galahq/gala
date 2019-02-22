# frozen_string_literal: true

# SpotlightAcknowledgements are created when a user dismisses an onboarding
# spotlight.
#
# @attr spotlight_key [String] a unique reference to a particular Spotlight,
#   matching one required by the personas’ onboarding scripts.
class SpotlightAcknowledgement < ApplicationRecord
  belongs_to :reader
end
