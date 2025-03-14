# frozen_string_literal: true

require 'sparql/client'
require 'json'
require 'date'
require 'active_support/core_ext/string/inflections'

# Wikidata service module - contains Wikidata integration functionality
#
# This module provides interfaces for interacting with Wikidata, including:
# - Searching for entities
# - Retrieving entity data
# - Generating structured JSON-LD
# - Synchronizing local data with Wikidata
#
# @example Searching for entities
#   client = Wikidata::Client.new
#   results = client.search("Einstein")
#
# @example Fetching entity data
#   client = Wikidata::Client.new
#   einstein = client.fetch(:researchers, "Q937")
#
# @example Syncing a case
#   client = Wikidata::Client.new
#   client.sync_case(my_case)
#
# @see Wikidata::Client
# @see Wikidata::QueryService
# @see Wikidata::SyncService
module Wikidata
  # The SPARQL endpoint URL for Wikidata queries
  ENDPOINT = 'https://query.wikidata.org/sparql'
end

# Require all component files
require_relative 'wikidata/service'
require_relative 'wikidata/query_templates'
require_relative 'wikidata/query_service'
require_relative 'wikidata/json_ld_generator'
require_relative 'wikidata/sync_service'
require_relative 'wikidata/client'

# Usage examples:
#
# # Create a client
# client = Wikidata::Client.new
#
# # Search for entities
# results = client.search("Einstein")
#
# # Fetch entity data
# einstein = client.fetch(:researchers, "Q937")
#
# # Sync a case
# client.sync_case(my_case)
