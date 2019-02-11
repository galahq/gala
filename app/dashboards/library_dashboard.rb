# frozen_string_literal: true

require 'administrate/base_dashboard'

class LibraryDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    cases: Field::HasMany,
    managerships: Field::HasMany,
    managers: Field::HasMany.with_options(class_name: 'Reader'),
    logo_attachment: Field::HasOne,
    logo_blob: Field::HasOne,
    id: Field::Number,
    slug: Field::String,
    logo_url: Field::String,
    background_color: Field::String,
    foreground_color: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    description: Field::String.with_options(searchable: false),
    url: Field::String.with_options(searchable: false),
    name: Field::String.with_options(searchable: false),
    cases_count: Field::Number,
    visible_in_catalog_at: Field::DateTime
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    name
    cases
    managerships
    visible_in_catalog_at
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    id
    slug
    name
    description
    url
    background_color
    foreground_color
    visible_in_catalog_at
    cases
    managerships
    created_at
    updated_at
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    cases
    managerships
    managers
    logo_attachment
    logo_blob
    slug
    logo_url
    background_color
    foreground_color
    description
    url
    name
    cases_count
    visible_in_catalog_at
  ].freeze

  def display_resource(library)
    library.name
  end
end
