# frozen_string_literal: true

require 'administrate/base_dashboard'

class CaseDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    acknowledgements: Field::Text,
    active_locks: Field::HasMany.with_options(class_name: 'Lock'),
    audience: Field::Text,
    authors: Field::String.with_options(searchable: false),
    cards: Field::HasMany,
    case_elements: Field::HasMany,
    classroom_timeline: Field::Text,
    comment_threads: Field::HasMany,
    commentable: Field::Boolean,
    comments: Field::HasMany,
    cover_image: Field::ActiveStorage,
    created_at: Field::DateTime,
    dek: Field::Text,
    deployments: Field::HasMany,
    edgenotes: Field::HasMany,
    editors: Field::HasMany.with_options(class_name: 'Reader'),
    editorships: Field::HasMany,
    enrollments: Field::HasMany,
    featured_at: Field::DateTime,
    forums: Field::HasMany,
    id: Field::Number,
    kicker: Field::String,
    latitude: Field::Number.with_options(decimals: 2),
    learning_objectives: Field::String.with_options(searchable: false),
    library: Field::BelongsTo
                    .with_options(searchable: true, searchable_field: :name),
    locale: Field::Text,
    lock: Field::HasOne,
    longitude: Field::Number.with_options(decimals: 2),
    pages: Field::HasMany,
    photo_credit: Field::Text,
    podcasts: Field::HasMany,
    published_at: Field::DateTime,
    quizzes: Field::HasMany,
    readers: Field::HasMany,
    roles: Field::HasMany,
    slug: Field::Text,
    slugs: Field::HasMany.with_options(class_name: 'FriendlyId::Slug'),
    summary: Field::Text,
    taggings: Field::HasMany,
    tags: Field::HasMany,
    teaching_guide_attachment: Field::HasOne,
    teaching_guide_blob: Field::HasOne,
    title: Field::Text,
    translation_base: Field::BelongsTo.with_options(class_name: 'Case'),
    translation_base_id: Field::Number,
    translators: Field::String.with_options(searchable: false),
    updated_at: Field::DateTime,
    zoom: Field::Number.with_options(decimals: 2)
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = %i[
    id
    slug
    kicker
    locale
    case_elements
    enrollments
    deployments
    comments
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :id,
    :slug,
    :kicker,
    :title,
    :created_at,
    :updated_at,
    :published_at,
    :featured_at,
    :library,
    :locale,
    :editorships,
    :enrollments,
    :deployments,
    :comments

    # :tags,
    # :translation_base,
    # :active_locks,
    # :cards,
    # :case_elements,
    # :comment_threads,
    # :comments,
    # :edgenotes,
    # :editorships,
    # :editors,
    # :forums,
    # :quizzes,
    # :readers,
    # :pages,
    # :podcasts,
    # :cover_image_attachment,
    # :cover_image_blob,
    # :teaching_guide_attachment,
    # :teaching_guide_blob,
    # :roles,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :id,
    :slug,
    :kicker,
    :title,
    :created_at,
    :updated_at,
    :published_at,
    :featured_at,
    :locale,
    :translation_base,
    :editorships,
    :deployments,
    :enrollments

    # :lock,
    # :taggings,
    # :tags,
    # :slugs,
    # :library,
    # :active_locks,
    # :cards,
    # :case_elements,
    # :comment_threads,
    # :comments,
    # :deployments,
    # :edgenotes,
    # :editors,
    # :enrollments,
    # :forums,
    # :quizzes,
    # :readers,
    # :pages,
    # :podcasts,
    # :cover_image_attachment,
    # :cover_image_blob,
    # :teaching_guide_attachment,
    # :teaching_guide_blob,
    # :roles,
  ].freeze

  # Overwrite this method to customize how cases are displayed
  # across all pages of the admin dashboard.
  #
  def display_resource(kase)
    "“#{kase.kicker}”"
  end
end
