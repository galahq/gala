class AnonymousUser
  include Authority::UserAbilities

  def has_role? role, resource = nil
    false
  end
end
