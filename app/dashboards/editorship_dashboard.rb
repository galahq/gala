require "administrate/base_dashboard"

class EditorshipDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    case: Field::BelongsTo,
    editor: Field::BelongsTo.with_options(class_name: 'Reader'),
    created_at: Field::DateTime,
  }

  COLLECTION_ATTRIBUTES = [
    :editor,
    :case,
    :created_at,
  ]

  SHOW_PAGE_ATTRIBUTES = [
    :editor,
    :case,
    :created_at,
  ]

  FORM_ATTRIBUTES = [
    :editor,
    :case,
    :created_at,
  ]
end
