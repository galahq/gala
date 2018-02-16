# frozen_string_literal: true

# Null object for {Reader} which is returned by
# {ApplicationController#current_user} when nobody is logged in.
#
# @see Reader
class AnonymousUser
  # @return [false]
  def has_role?(_role, _resource = nil) # rubocop:disable Naming/PredicateName
    false
  end
  alias has_cached_role? has_role?

  # @return [nil]
  def enrollment_for_case(_c)
    nil
  end

  # @return [ActiveRecord::Relation<Enrollment>] an empty relation
  def enrollments
    Enrollment.none
  end

  # @return [Array(GlobalGroup)]
  def groups
    [GlobalGroup.new]
  end
end
