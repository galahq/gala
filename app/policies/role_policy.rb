# frozen_string_literal: true

# @see Role
#
# Granting or revoking a {Role} is a global-admin action: `create?`/`destroy?`
# inherit {ApplicationPolicy}'s `editor?` requirement. Anyone who is not a global
# editor is denied — including the anonymous user, whose `has_cached_role?`
# returns false.
class RolePolicy < ApplicationPolicy
end
