# frozen_string_literal: true

class WikidataLink < ApplicationRecord
  belongs_to :record,
             polymorphic: true, inverse_of: :wikidata_links

  validates :record_type, presence: true
  validates :record_id, presence: true
  validates :schema, presence: true
  validates :qid, presence: true

  def fetch_and_update_data!
    wikidata_data = Wikidata.new(I18n.locale).canned_query(schema, qid)
    update!(
      cached_json: wikidata_data,
      last_synced_at: Time.current
    )
  end
end
