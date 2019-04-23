# frozen_string_literal: true

require 'administrate/base_dashboard'

class ReadingListDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    cases: Field::HasMany,
    created_at: Field::DateTime,
    description: Field::Text,
    id: Field::Number,
    reader: Field::BelongsTo,
    reading_list_items: Field::HasMany,
    reading_list_saves: Field::HasMany,
    social_image: Field::ActiveStorage,
    title: Field::String,
    updated_at: Field::DateTime,
    uuid: Field::String.with_options(searchable: false)
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    social_image
    title
    reader
    cases
    reading_list_saves
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    id
    uuid
    social_image
    title
    description
    reader
    reading_list_items
    reading_list_saves
    created_at
    updated_at
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    reader
    reading_list_saves
    reading_list_items
    cases
    social_image_attachment
    social_image_blob
    uuid
    title
    description
  ].freeze

  # Overwrite this method to customize how reading lists are displayed
  # across all pages of the admin dashboard.

  def display_resource(reading_list)
    reading_list.title
  end
end
