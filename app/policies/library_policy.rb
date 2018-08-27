# frozen_string_literal: true

# @see Library
class LibraryPolicy < ApplicationPolicy
  # The Libraries this user can see in the index
  class Scope < Scope
    def resolve
      scope.where(Arel.sql('cases_count > 0'))
           .or(scope.where(id: AdminScope.new(user, Library).resolve))
    end
  end

  # Libraries to which this user can add a case
  class AdminScope < Scope
    def resolve
      if editor?
        scope.all
      else
        scope.merge user.libraries
      end
    end
  end

  def update?
    record.managers.include?(user) || editor?
  end
end
