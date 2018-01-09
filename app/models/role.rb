# frozen_string_literal: true

# A [rolify](https://github.com/RolifyCommunity/rolify) role held by a {Reader}.
#
# ### Significant roles
# - `:editor` – admin
# - `:invisible` – ignored by the summary statistics of {Ahoy::Event}s
#
# @attr name [String]
class Role < ApplicationRecord
  default_scope { order('id ASC') }

  has_and_belongs_to_many :readers, join_table: :readers_roles

  belongs_to :resource, polymorphic: true,
                        optional: true

  validates :resource_type, inclusion: { in: Rolify.resource_types },
                            allow_nil: true

  scopify
end
