# frozen_string_literal: true

# Null object for {Reader} which is returned by
# {ApplicationController#current_user} when nobody is logged in.
#
# @see Reader
class AnonymousUser
  def id
    nil
  end

  def persisted?
    false
  end

  def locale
    I18n.locale
  end

  # @return [false]
  def has_role?(_role, _resource = nil) # rubocop:disable Naming/PredicateName
    false
  end
  alias has_cached_role? has_role?

  # @return [nil]
  def enrollment_for_case(_c)
    nil
  end

  # @return [nil]
  def request_for_case(_c)
    nil
  end

  # @return [ActiveRecord::Relation<Case>] an empty relation
  def managed_cases
    Case.none
  end

  # @return [ActiveRecord::Relation<Case>] an empty relation
  def cases
    Case.none
  end

  # @return [ActiveRecord::Relation<Case>] an empty relation
  def my_cases
    Case.none
  end

  # @return [ActiveRecord::Relation<Case>] an empty relation
  def enrolled_cases
    Case.none
  end

  # @return [ActiveRecord::Relation<Enrollment>] an empty relation
  def enrollments
    Enrollment.none
  end

  # @return [ActiveRecord::Relation<Library>] an empty relation
  def libraries
    Library.none
  end

  # @return [ActiveRecord::Relation<Editorship>] an empty relation
  def editorships
    Editorship.none
  end

  # @return [ActiveRecord::Relation<Deployment>] an empty relation
  def deployments
    Deployment.none
  end

  # @return [Array(GlobalGroup)]
  def groups
    [GlobalGroup.new]
  end
end
