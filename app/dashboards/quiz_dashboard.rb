# frozen_string_literal: true

require 'administrate/base_dashboard'

class QuizDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    custom_questions: Field::HasMany.with_options(class_name: 'Question'),
    deployments: Field::HasMany,
    submissions: Field::HasMany,
    author: Field::BelongsTo.with_options(class_name: 'Reader'),
    case: Field::BelongsTo,
    template: Field::BelongsTo.with_options(class_name: 'Quiz'),
    id: Field::Number,
    template_id: Field::Number,
    customized: Field::Boolean,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    author_id: Field::Number,
    lti_uid: Field::String,
    title: Field::String
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    title
    case
    author
    custom_questions
    template
    deployments
    submissions
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = %i[
    id
    title
    case
    customized
    author
    lti_uid
    template
    custom_questions
    submissions
    deployments
    created_at
    updated_at
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = %i[
    custom_questions
    deployments
    submissions
    author
    case
    template
    template_id
    customized
    author_id
    lti_uid
    title
  ].freeze

  # Overwrite this method to customize how quizzes are displayed
  # across all pages of the admin dashboard.
  #
  # def display_resource(quiz)
  #   "Quiz ##{quiz.id}"
  # end
end
