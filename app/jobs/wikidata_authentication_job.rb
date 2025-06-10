# frozen_string_literal: true

# Job to refresh the Wikidata OAuth2 token
class WikidataAuthenticationJob < ApplicationJob
  queue_as :default

  def perform
    Wikidata.refresh_token
  end
end
