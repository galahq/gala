# frozen_string_literal: true

class LinkExpansion
  # Configuration for a particular Edgenote’s link expansion is stored in the
  # database
  #
  # @attr no_description [Boolean] Don’t use the description from OpenGraph
  # @attr no_embed [Boolean] Show OpenGraph preview even when OEmbed is available
  # @attr no_image [Boolean] Don’t use the image from OpenGraph
  class Visibility < ApplicationRecord
    self.table_name = :link_expansion_visibilities

    belongs_to :edgenote, touch: true
  end
end
