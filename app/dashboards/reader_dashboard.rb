require "administrate/base_dashboard"

class ReaderDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    authentication_strategies: Field::HasMany,
    enrollments: Field::HasMany,
    enrolled_cases: Field::HasMany.with_options(class_name: 'Case'),
    group_memberships: Field::HasMany,
    groups: Field::HasMany,
    deployments: Field::HasMany,
    submissions: Field::HasMany,
    answers: Field::HasMany,
    quizzes: Field::HasMany,
    invitations: Field::HasMany,
    invited_communities: Field::HasMany.with_options(class_name: "Community"),
    group_communities: Field::HasMany.with_options(class_name: "Community"),
    comment_threads: Field::HasMany,
    comments: Field::HasMany,
    events: Field::HasMany.with_options(class_name: "Ahoy::Event"),
    editorships: Field::HasMany,
    my_cases: Field::HasMany.with_options(class_name: "Case"),
    managerships: Field::HasMany,
    libraries: Field::HasMany,
    image_attachment: Field::HasOne,
    image_blob: Field::HasOne,
    roles: Field::HasMany,
    id: Field::Number,
    name: Field::Text,
    image_url: Field::Text,
    email: Field::String,
    encrypted_password: Field::String,
    reset_password_token: Field::String,
    reset_password_sent_at: Field::DateTime,
    remember_created_at: Field::DateTime,
    sign_in_count: Field::Number,
    current_sign_in_at: Field::DateTime,
    last_sign_in_at: Field::DateTime,
    current_sign_in_ip: Field::String.with_options(searchable: false),
    last_sign_in_ip: Field::String.with_options(searchable: false),
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    initials: Field::Text,
    locale: Field::Text,
    confirmation_token: Field::String,
    confirmed_at: Field::DateTime,
    confirmation_sent_at: Field::DateTime,
    unconfirmed_email: Field::String,
    created_password: Field::Boolean,
    send_reply_notifications: Field::Boolean,
    active_community: Field::BelongsTo.with_options(class_name: "Community")
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :name,
    :email,
    :editorships,
    :enrollments,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :id,
    :name,
    :email,
    :sign_in_count,
    :current_sign_in_at,
    :created_at,
    :locale,
    :created_password,
    :send_reply_notifications,
    :active_community,
    :editorships,
    :enrollments,
    :submissions,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :id,
    :name,
    :email,
    :sign_in_count,
    :current_sign_in_at,
    :created_at,
    :locale,
    :created_password,
    :send_reply_notifications,
    :active_community,
  ].freeze

  def display_resource(reader)
    reader.name
  end
end
