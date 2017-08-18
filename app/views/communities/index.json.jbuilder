# frozen_string_literal: true

json.key_format! camelize: :lower

json.communities do
  json.array! @communities, partial: 'communities/community', as: 'community'
end
