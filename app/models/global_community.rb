# frozen_string_literal: true

# Null object for {Community} of which every {Reader} is a member and in which
# every {Case} has a {Forum}
#
# @see Community
class GlobalCommunity
  include Singleton

  alias read_attribute_for_serialization send

  def to_partial_path
    'communities/community'
  end

  def marked_for_destruction?
    false
  end

  def id
    nil
  end

  def name
    I18n.t 'activerecord.models.global_community'
  end

  def description
    ''
  end

  def global?
    true
  end

  def forums
    Forum.where community_id: nil
  end

  def memberships
    GroupMembership.none
  end
end
