# frozen_string_literal: true

json.key_format! camelize: :lower
json.extract! @reader, :id, :name, :email, :initials, :image_url,
              :active_community_id
