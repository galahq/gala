# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! community, :id, :name
json.active community == current_reader.active_community
json.global community.global?
