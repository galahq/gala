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
    Role.all.each_with_object({}) do |role, hash|
      hash[role.name] = object.roles.include? role
    end
  end

  def unacknowledged_spotlights
    return object.unacknowledged_spotlights unless
      instance_options[:force_spotlight_acknowledgements]

    object.onboarding_script.all_spotlights
  end
end
