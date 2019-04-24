# frozen_string_literal: true

require 'administrate/base_dashboard'

class AnnouncementDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    content: Field::Text,
    created_at: Field::DateTime,
    deactivated_at: Field::DateTime,
    id: Field::Number,
    updated_at: Field::DateTime,
    url: Field::String,
    visible_logged_out: Field::Boolean
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    content
    visible_logged_out
    deactivated_at
    created_at
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    id
    content
    url
    visible_logged_out
    deactivated_at
    created_at
    updated_at
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    content
    url
    visible_logged_out
    deactivated_at
  ].freeze

  # Overwrite this method to customize how announcements are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(announcement)
  #   "Announcement ##{announcement.id}"
  # end
end
