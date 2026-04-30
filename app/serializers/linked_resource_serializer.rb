# frozen_string_literal: true

class LinkedResourceSerializer < ApplicationSerializer
  attributes :id, :category, :name, :url_or_doi, :description, :position
end
# frozen_string_literal: true

# @see LinkedResource
class LinkedResourceSerializer < ApplicationSerializer
  attributes :id,
             :category,
             :name,
             :url_or_doi,
             :wikidata_qid,
             :description,
             :position
end
