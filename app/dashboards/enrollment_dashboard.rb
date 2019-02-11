# frozen_string_literal: true

require 'administrate/base_dashboard'

class EnrollmentDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    reader: Field::BelongsTo,
    case: Field::BelongsTo,
    active_group: Field::BelongsTo.with_options(class_name: 'Group'),
    id: Field::Number,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    status: Field::String.with_options(searchable: false),
    active_group_id: Field::Number,
    case_completion: PercentField
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    reader
    case
    status
    case_completion
    created_at
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    reader
    case
    active_group
    id
    created_at
    updated_at
    status
    active_group_id
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    reader
    case
    active_group
    status
    active_group_id
  ].freeze

  # Overwrite this method to customize how enrollments are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(enrollment)
  #   "Enrollment ##{enrollment.id}"
  # end
end
