# frozen_string_literal: true

json.key_format! camelcase: :lower

json.array! @enrollments do |enrollment|
  json.extract! enrollment, :id, :status
  json.case_slug enrollment.case.slug
end
