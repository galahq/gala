# frozen_string_literal: true

class WikidataLink < ApplicationRecord
  belongs_to :record,
             polymorphic: true, inverse_of: :wikidata_links

  validates :record_type, presence: true
  validates :record_id, presence: true
  validates :schema, presence: true
  validates :qid, presence: true
end
