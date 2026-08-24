# frozen_string_literal: true

# SpotlightAcknowledgements are created when a user dismisses an onboarding
# spotlight.
#
# @attr spotlight_key [String] a unique reference to a particular Spotlight,
#   matching one required by the personas’ onboarding scripts.
class SpotlightAcknowledgement < ApplicationRecord
  # touch rotates reader.cache_key so cached payloads embedding
  # unacknowledgedSpotlights (window.reader) don't resurrect dismissed ones.
  belongs_to :reader, touch: true
end
