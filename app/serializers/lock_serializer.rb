# frozen_string_literal: true

# @see Lock
class LockSerializer < ApplicationSerializer
  class LockableSerializer < ApplicationSerializer; end

  attributes :created_at
  attribute(:case_slug) { object.case.slug }

  belongs_to :lockable, serializer: LockableSerializer
  belongs_to :reader, serializer: Readers::IdenticonSerializer
end
