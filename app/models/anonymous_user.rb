class AnonymousUser
  include Authority::UserAbilities

  def has_role? role, resource = nil
    false
  end
  alias_method :has_cached_role?, :has_role?

  def enrollment_for_case(c)
    nil
  end

end
