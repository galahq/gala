# frozen_string_literal: true

class AnonymousUser
  include Authority::UserAbilities

  def has_role?(_role, _resource = nil)
    false
  end
  alias has_cached_role? has_role?

  def enrollment_for_case(_c)
    nil
  end

  def groups
    [GlobalGroup.new]
  end
end
