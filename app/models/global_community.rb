# frozen_string_literal: true

# Null object pattern for Community
class GlobalCommunity
  include Singleton

  def forums
    Forum.where community_id: nil
  end
end
