# frozen_string_literal: true

require 'administrate/base_dashboard'

class EditorshipDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    case: Field::BelongsTo,
    editor: Field::BelongsTo.with_options(class_name: 'Reader'),
    created_at: Field::DateTime
  }.freeze

  COLLECTION_ATTRIBUTES = %i[
    editor
    case
    created_at
  ].freeze

  SHOW_PAGE_ATTRIBUTES = %i[
    editor
    case
    created_at
  ].freeze

  FORM_ATTRIBUTES = %i[
    editor
    case
    created_at
  ].freeze
end
