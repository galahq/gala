# frozen_string_literal: true

# Null object for {Community} of which every {Reader} is a member and in which
# every {Case} has a {Forum}
#
# @see Community
class GlobalCommunity
  include Singleton

  def to_partial_path
    'communities/community'
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
end
