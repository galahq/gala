# frozen_string_literal: true

require 'administrate/base_dashboard'

class AnswerDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    question: Field::BelongsTo,
    quiz: Field::BelongsTo,
    reader: Field::BelongsTo,
    submission: Field::BelongsTo,
    id: Field::Number,
    content: Field::String,
    correct: Field::Boolean,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    case_completion: PercentField
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    question
    reader
    content
    correct
    case_completion
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    id
    reader
    quiz
    question
    submission
    content
    correct
    case_completion
    created_at
    updated_at
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    question
    quiz
    reader
    submission
    content
    correct
    case_completion
  ].freeze

  # Overwrite this method to customize how answers are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(answer)
  #   "Answer ##{answer.id}"
  # end
end
