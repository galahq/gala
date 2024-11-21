# frozen_string_literal: true

class WikidataLink < ApplicationRecord
  belongs_to :case

  validates :object_type, presence: true
  validates :object_id, presence: true
  validates :schema, presence: true
  validates :qid, presence: true
end
