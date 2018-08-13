# frozen_string_literal: true

# @see Activity
class ActivityCloner < ElementCloner
  include_association :card, params: true
end
