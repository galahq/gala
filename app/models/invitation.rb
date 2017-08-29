# frozen_string_literal: true

class Invitation < ApplicationRecord
  belongs_to :reader
  belongs_to :community

  belongs_to :inviter, class_name: 'Reader'
end
