# frozen_string_literal: true

class Community < ApplicationRecord
  belongs_to :group
  has_many :invitations
  has_many :forums # One forum for each case the community is discussing

  include Mobility
  translates :name

  delegate :comment_threads, to: :forum

  def self.active_for_case(case_id)
    joins(:forums).where(forums: { case_id: case_id })
  end

  def global?
    group.nil?
  end
end
