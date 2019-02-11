# frozen_string_literal: true

require 'administrate/base_dashboard'

class CommentThreadDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    card: Field::BelongsTo,
    case: Field::BelongsTo,
    case_id: Field::Number,
    collocutors: Field::HasMany.with_options(class_name: 'Reader'),
    comments: Field::HasMany,
    comments_count: Field::Number,
    community: Field::BelongsTo,
    created_at: Field::DateTime,
    forum: Field::BelongsTo,
    id: Field::Number,
    locale: Field::String,
    original_highlight_text: Field::String,
    reader: Field::BelongsTo,
    updated_at: Field::DateTime
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    case
    card
    community
    collocutors
    comments
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    id
    case
    card
    community
    forum
    original_highlight_text
    locale
    comments
    created_at
    updated_at
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    card
    forum
    reader
    comments
    case_id
    original_highlight_text
    locale
    comments_count
  ].freeze

  # Overwrite this method to customize how comment threads are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(comment_thread)
  #   "CommentThread ##{comment_thread.id}"
  # end
end
