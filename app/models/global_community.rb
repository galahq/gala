# frozen_string_literal: true

# Null object pattern for Community
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

  def global?
    true
  end

  def forums
    Forum.where community_id: nil
  end
end
