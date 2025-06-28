# frozen_string_literal: true

# @see WikidataLink
class WikidataLinkSerializer < ApplicationSerializer
  attributes :id, :qid, :schema, :position
end
