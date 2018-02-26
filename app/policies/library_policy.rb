# frozen_string_literal: true

# @see Library
class LibraryPolicy < ApplicationPolicy
  # Libraries to which this user can add a case
  class Scope < Scope
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
