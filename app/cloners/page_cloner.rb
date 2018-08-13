# frozen_string_literal: true

# @see Page
class PageCloner < ElementCloner
  include_association :cards, params: true
end
