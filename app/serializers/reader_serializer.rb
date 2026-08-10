# frozen_string_literal: true

# @see Reader
class ReaderSerializer < ApplicationSerializer
  attributes :id, :name, :image_url, :email, :initials, :hash_key, :persona,
             :unacknowledged_spotlights
  attribute :roles

  has_one :active_community

  def initialize(*props)
    super(*props)
    self.object = object.decorate
  end

  def roles
    reader_role_ids = object.roles.map(&:id).to_set
    Role.all.each_with_object({}) do |role, hash|
      hash[role.name] = reader_role_ids.include?(role.id)
    end
  end
end
