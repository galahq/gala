class AnonymousUser
  include Authority::UserAbilities

  def has_role? role, resource = nil
    false
  end

  def enrollment_for_case(c)
    nil
  end

end
