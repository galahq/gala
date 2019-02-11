require "administrate/base_dashboard"

class QuestionDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    answers: Field::HasMany,
    quiz: Field::BelongsTo,
    id: Field::Number,
    correct_answer: Field::Text,
    options: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    content: Field::String.with_options(searchable: false),
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :content,
    :quiz,
    :options,
    :correct_answer,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :id,
    :quiz,
    :content,
    :options,
    :correct_answer,
    :answers,
    :created_at,
    :updated_at,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :answers,
    :quiz,
    :correct_answer,
    :options,
    :content,
  ].freeze

  def display_resource(question)
    question.content.truncate(50)
  end
end
