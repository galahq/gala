# frozen_string_literal: true

# @see Reader
class ReaderSerializer < ApplicationSerializer
  attributes :id, :name, :image_url, :email, :initials, :hash_key,
             :unacknowledged_spotlights
  attribute :roles

  has_one :active_community

  def initialize(*props)
    super(*props)
    self.object = object.decorate
  end

  def roles
    Role.all.each_with_object({}) do |role, hash|
      hash[role.name] = object.roles.include? role
    end
  end
end
