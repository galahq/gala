class AnonymousUser
  include Authority::UserAbilities

  def has_role? role
    false
  end
end
