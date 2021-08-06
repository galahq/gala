# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! community, :id, :name, :description
json.active community == current_reader.active_community
