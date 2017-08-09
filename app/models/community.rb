# frozen_string_literal: true

class Community < ApplicationRecord
  belongs_to :group
  has_one :forum
  has_and_belongs_to_many :readers

  include Mobility
  translates :name
end
