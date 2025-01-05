# frozen_string_literal: true

# @see Page
class PageCloner < ElementCloner
  include_associations :cards, params: true
end
