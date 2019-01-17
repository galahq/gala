# frozen_string_literal: true

# @see Community
class CommunitySerializer < ApplicationSerializer
  attributes :name, :description
  attribute(:active) { object == current_user.active_community }
  attribute(:global) { object.global? }
end
