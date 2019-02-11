# frozen_string_literal: true

require 'administrate/base_dashboard'

class CardDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    lock: Field::HasOne,
    case: Field::BelongsTo,
    element: Field::Polymorphic,
    comment_threads: Field::HasMany,
    id: Field::Number,
    position: Field::Number,
    page_id: Field::Number,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    solid: Field::Boolean,
    raw_content: Field::String.with_options(searchable: false)
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    lock
    case
    element
    comment_threads
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    lock
    case
    element
    comment_threads
    id
    position
    page_id
    created_at
    updated_at
    solid
    raw_content
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    lock
    case
    element
    comment_threads
    position
    page_id
    solid
    raw_content
  ].freeze

  def display_resource(card)
    "Card #{card.position} on Page #{card.case_element.position}"
  end
end
