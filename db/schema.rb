# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_05_14_190157) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "hstore"
  enable_extension "pg_stat_statements"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "action_mailbox_inbound_emails", force: :cascade do |t|
    t.integer "status", default: 0, null: false
    t.string "message_id", null: false
    t.string "message_checksum", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["message_id", "message_checksum"], name: "index_action_mailbox_inbound_emails_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "activities", id: :serial, force: :cascade do |t|
    t.hstore "title_i18n"
    t.hstore "description_i18n"
    t.hstore "pdf_url_i18n"
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "position"
    t.index ["case_id"], name: "index_activities_on_case_id"
  end

  create_table "ahoy_events", id: :serial, force: :cascade do |t|
    t.integer "visit_id"
    t.integer "user_id"
    t.string "name"
    t.jsonb "properties"
    t.datetime "time"
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time"
    t.index ["properties"], name: "index_ahoy_events_on_properties_jsonb_path_ops", opclass: :jsonb_path_ops, using: :gin
    t.index ["user_id", "name"], name: "index_ahoy_events_on_user_id_and_name"
    t.index ["visit_id", "name"], name: "index_ahoy_events_on_visit_id_and_name"
  end

  create_table "announcements", force: :cascade do |t|
    t.text "content"
    t.string "url"
    t.boolean "visible_logged_out"
    t.datetime "deactivated_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["created_at"], name: "index_announcements_on_created_at"
    t.index ["deactivated_at"], name: "index_announcements_on_deactivated_at"
  end

  create_table "answers", id: :serial, force: :cascade do |t|
    t.integer "question_id"
    t.integer "quiz_id"
    t.integer "reader_id"
    t.string "content"
    t.boolean "correct"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "case_completion"
    t.bigint "submission_id"
    t.index ["question_id"], name: "index_answers_on_question_id"
    t.index ["quiz_id"], name: "index_answers_on_quiz_id"
    t.index ["reader_id"], name: "index_answers_on_reader_id"
    t.index ["submission_id"], name: "index_answers_on_submission_id"
  end

  create_table "authentication_strategies", id: :serial, force: :cascade do |t|
    t.string "provider"
    t.string "uid"
    t.integer "reader_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reader_id"], name: "index_authentication_strategies_on_reader_id"
    t.index ["uid"], name: "index_authentication_strategies_on_uid", where: "((provider)::text = 'lti'::text)"
  end

  create_table "cards", id: :serial, force: :cascade do |t|
    t.integer "position"
    t.integer "page_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "solid", default: true
    t.string "element_type"
    t.integer "element_id"
    t.integer "case_id"
    t.jsonb "raw_content", default: ""
    t.index ["case_id"], name: "index_cards_on_case_id"
    t.index ["element_type", "element_id"], name: "index_cards_on_element_type_and_element_id"
    t.index ["page_id"], name: "index_cards_on_page_id"
  end

  create_table "case_archives", force: :cascade do |t|
    t.bigint "case_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["case_id"], name: "index_case_archives_on_case_id"
  end

  create_table "case_elements", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.string "element_type"
    t.integer "element_id"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id"], name: "index_case_elements_on_case_id"
    t.index ["element_id", "element_type"], name: "index_case_elements_on_element_id_and_element_type"
    t.index ["element_type", "element_id"], name: "index_case_elements_on_element_type_and_element_id"
  end

  create_table "cases", id: :serial, force: :cascade do |t|
    t.boolean "published", default: false
    t.hstore "title_i18n"
    t.text "slug", null: false
    t.string "authors", default: [], array: true
    t.hstore "summary_i18n"
    t.text "tags", default: [], array: true
    t.hstore "narrative_i18n"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cover_url"
    t.date "publication_date"
    t.integer "catalog_position", default: 0, null: false
    t.text "short_title"
    t.hstore "translators", default: {}, null: false
    t.hstore "kicker_i18n"
    t.hstore "dek_i18n"
    t.text "photo_credit"
    t.index ["slug"], name: "index_cases_on_slug", unique: true
    t.index ["tags"], name: "index_cases_on_tags", using: :gin
  end

  create_table "comment_threads", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "original_highlight_text"
    t.string "locale"
    t.integer "card_id"
    t.integer "reader_id"
    t.integer "forum_id"
    t.integer "comments_count"
    t.string "key"
    t.index ["card_id"], name: "index_comment_threads_on_card_id"
    t.index ["case_id"], name: "index_comment_threads_on_case_id"
    t.index ["forum_id"], name: "index_comment_threads_on_forum_id"
    t.index ["key"], name: "index_comment_threads_on_key", unique: true
    t.index ["reader_id"], name: "index_comment_threads_on_reader_id"
  end

  create_table "comments", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "comment_thread_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "position"
    t.jsonb "content", default: ""
    t.index ["comment_thread_id"], name: "index_comments_on_comment_thread_id"
    t.index ["reader_id"], name: "index_comments_on_reader_id"
  end

  create_table "communities", id: :serial, force: :cascade do |t|
    t.jsonb "name"
    t.integer "group_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "description", default: ""
    t.boolean "universal", default: false
    t.index ["group_id"], name: "index_communities_on_group_id"
    t.index ["universal"], name: "index_communities_on_universal"
  end

  create_table "deployments", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.integer "group_id"
    t.integer "quiz_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "answers_needed", default: 1
    t.string "key"
    t.index ["case_id"], name: "index_deployments_on_case_id"
    t.index ["group_id", "case_id"], name: "index_deployments_on_group_id_and_case_id", unique: true
    t.index ["group_id"], name: "index_deployments_on_group_id"
    t.index ["key"], name: "index_deployments_on_key", unique: true
    t.index ["quiz_id"], name: "index_deployments_on_quiz_id"
  end

  create_table "edgenotes", id: :serial, force: :cascade do |t|
    t.string "format"
    t.string "thumbnail_url"
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "slug", null: false
    t.integer "card_id"
    t.integer "style", default: 0
    t.string "alt_text"
    t.boolean "highlighted", default: false
    t.text "attribution", default: ""
    t.text "audio_url", default: ""
    t.text "call_to_action", default: ""
    t.text "caption", default: ""
    t.text "content", default: ""
    t.text "embed_code", default: ""
    t.text "image_url", default: ""
    t.text "instructions", default: ""
    t.text "pdf_url", default: ""
    t.text "photo_credit", default: ""
    t.text "pull_quote", default: ""
    t.text "website_url", default: ""
    t.text "icon_slug"
    t.index ["card_id"], name: "index_edgenotes_on_card_id"
    t.index ["case_id"], name: "index_edgenotes_on_case_id"
    t.index ["slug"], name: "index_edgenotes_on_slug", unique: true
  end

  create_table "editorships", force: :cascade do |t|
    t.bigint "case_id"
    t.bigint "editor_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id", "editor_id"], name: "index_editorships_on_case_id_and_editor_id"
    t.index ["case_id"], name: "index_editorships_on_case_id"
    t.index ["editor_id"], name: "index_editorships_on_editor_id"
  end

  create_table "enrollments", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status", default: 0
    t.integer "active_group_id"
    t.index ["case_id", "reader_id"], name: "index_enrollments_on_case_id_and_reader_id"
    t.index ["case_id"], name: "index_enrollments_on_case_id"
    t.index ["reader_id"], name: "index_enrollments_on_reader_id"
  end

  create_table "forums", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.integer "community_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id"], name: "index_forums_on_case_id"
    t.index ["community_id"], name: "index_forums_on_community_id"
  end

  create_table "friendly_id_slugs", force: :cascade do |t|
    t.string "slug", null: false
    t.integer "sluggable_id", null: false
    t.string "sluggable_type", limit: 50
    t.string "scope"
    t.datetime "created_at"
    t.index ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true
    t.index ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type"
    t.index ["sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_id"
    t.index ["sluggable_type"], name: "index_friendly_id_slugs_on_sluggable_type"
  end

  create_table "group_memberships", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "group_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status", default: 0, null: false
    t.index ["group_id"], name: "index_group_memberships_on_group_id"
    t.index ["reader_id"], name: "index_group_memberships_on_reader_id"
  end

  create_table "groups", id: :serial, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "context_id"
    t.jsonb "name", default: ""
    t.index ["context_id"], name: "index_groups_on_context_id"
  end

  create_table "invitations", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "community_id"
    t.integer "inviter_id"
    t.datetime "accepted_at"
    t.datetime "rescinded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id", "reader_id"], name: "index_invitations_on_community_id_and_reader_id"
    t.index ["community_id"], name: "index_invitations_on_community_id"
    t.index ["reader_id"], name: "index_invitations_on_reader_id"
  end

  create_table "libraries", force: :cascade do |t|
    t.string "slug"
    t.string "logo_url"
    t.string "background_color"
    t.string "foreground_color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "description"
    t.jsonb "url"
    t.jsonb "name"
    t.integer "cases_count", default: 0
    t.datetime "visible_in_catalog_at"
    t.index ["slug"], name: "index_libraries_on_slug", unique: true
    t.index ["visible_in_catalog_at"], name: "index_libraries_on_visible_in_catalog_at"
  end

  create_table "link_expansion_visibilities", force: :cascade do |t|
    t.boolean "no_description", default: false
    t.boolean "no_embed", default: false
    t.boolean "no_image", default: false
    t.bigint "edgenote_id"
    t.index ["edgenote_id"], name: "index_link_expansion_visibilities_on_edgenote_id"
  end

  create_table "locks", force: :cascade do |t|
    t.string "lockable_type"
    t.bigint "lockable_id"
    t.bigint "reader_id"
    t.bigint "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id"], name: "index_locks_on_case_id"
    t.index ["lockable_type", "lockable_id"], name: "index_locks_on_lockable_type_and_lockable_id", unique: true
    t.index ["reader_id"], name: "index_locks_on_reader_id"
  end

  create_table "managerships", force: :cascade do |t|
    t.bigint "library_id"
    t.bigint "manager_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["library_id"], name: "index_managerships_on_library_id"
    t.index ["manager_id"], name: "index_managerships_on_manager_id"
  end

  create_table "pages", id: :serial, force: :cascade do |t|
    t.integer "position"
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "title", default: ""
    t.text "icon_slug"
    t.index ["case_id"], name: "index_pages_on_case_id"
  end

  create_table "podcasts", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "position"
    t.string "artwork_url"
    t.text "photo_credit"
    t.text "audio_url", default: ""
    t.text "credits", default: ""
    t.text "title", default: ""
    t.index ["case_id"], name: "index_podcasts_on_case_id"
  end

  create_table "questions", id: :serial, force: :cascade do |t|
    t.integer "quiz_id"
    t.text "correct_answer"
    t.string "options", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "content", default: ""
    t.index ["quiz_id"], name: "index_questions_on_quiz_id"
  end

  create_table "quizzes", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.integer "template_id"
    t.boolean "customized"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "author_id"
    t.string "lti_uid"
    t.string "title", default: ""
    t.index ["author_id"], name: "index_quizzes_on_author_id"
    t.index ["case_id"], name: "index_quizzes_on_case_id"
    t.index ["lti_uid"], name: "index_quizzes_on_lti_uid"
    t.index ["template_id"], name: "index_quizzes_on_template_id"
  end

  create_table "readers", id: :serial, force: :cascade do |t|
    t.text "name"
    t.text "image_url"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: ""
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "initials"
    t.text "locale"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.boolean "created_password", default: true
    t.boolean "send_reply_notifications", default: true
    t.integer "active_community_id"
    t.string "persona"
    t.datetime "seen_announcements_created_before"
    t.index ["active_community_id"], name: "index_readers_on_active_community_id"
    t.index ["confirmation_token"], name: "index_readers_on_confirmation_token", unique: true
    t.index ["email"], name: "index_readers_on_email", unique: true
    t.index ["reset_password_token"], name: "index_readers_on_reset_password_token", unique: true
  end

  create_table "readers_roles", id: false, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "role_id"
    t.index ["reader_id", "role_id"], name: "index_readers_roles_on_reader_id_and_role_id"
    t.index ["role_id"], name: "index_readers_roles_on_role_id"
  end

  create_table "reading_list_items", force: :cascade do |t|
    t.text "notes", default: "", null: false
    t.integer "position", null: false
    t.bigint "case_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "reading_list_id"
    t.index ["case_id"], name: "index_reading_list_items_on_case_id"
    t.index ["reading_list_id"], name: "index_reading_list_items_on_reading_list_id"
  end

  create_table "reading_list_saves", force: :cascade do |t|
    t.bigint "reader_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "reading_list_id"
    t.index ["reader_id", "reading_list_id"], name: "index_reading_list_saves_on_reader_id_and_reading_list_id", unique: true
    t.index ["reader_id"], name: "index_reading_list_saves_on_reader_id"
    t.index ["reading_list_id"], name: "index_reading_list_saves_on_reading_list_id"
  end

  create_table "reading_lists", force: :cascade do |t|
    t.uuid "uuid", default: -> { "gen_random_uuid()" }, null: false
    t.string "title", default: "", null: false
    t.text "description", default: "", null: false
    t.bigint "reader_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["reader_id"], name: "index_reading_lists_on_reader_id"
    t.index ["uuid"], name: "index_reading_lists_on_uuid", unique: true
  end

  create_table "reply_notifications", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "notifier_id"
    t.integer "comment_id"
    t.integer "comment_thread_id"
    t.integer "case_id"
    t.integer "page_id"
    t.integer "card_id"
    t.index ["reader_id"], name: "index_reply_notifications_on_reader_id"
  end

  create_table "roles", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "resource_type"
    t.integer "resource_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id"
    t.index ["name"], name: "index_roles_on_name"
  end

  create_table "spotlight_acknowledgements", force: :cascade do |t|
    t.bigint "reader_id"
    t.string "spotlight_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reader_id"], name: "index_spotlight_acknowledgements_on_reader_id"
  end

  create_table "submissions", force: :cascade do |t|
    t.bigint "quiz_id"
    t.bigint "reader_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quiz_id"], name: "index_submissions_on_quiz_id"
    t.index ["reader_id"], name: "index_submissions_on_reader_id"
  end

  create_table "taggings", force: :cascade do |t|
    t.bigint "case_id"
    t.bigint "tag_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id", "tag_id"], name: "index_taggings_on_case_id_and_tag_id", unique: true
    t.index ["case_id"], name: "index_taggings_on_case_id"
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
  end

  create_table "tags", force: :cascade do |t|
    t.boolean "category", default: false, null: false
    t.string "name", null: false
    t.jsonb "display_name"
    t.integer "taggings_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "visits", id: :serial, force: :cascade do |t|
    t.string "visit_token"
    t.string "visitor_token"
    t.string "ip"
    t.text "user_agent"
    t.text "referrer"
    t.text "landing_page"
    t.integer "user_id"
    t.string "referring_domain"
    t.string "search_keyword"
    t.string "browser"
    t.string "os"
    t.string "device_type"
    t.integer "screen_height"
    t.integer "screen_width"
    t.string "country"
    t.string "region"
    t.string "city"
    t.string "postal_code"
    t.decimal "latitude"
    t.decimal "longitude"
    t.string "utm_source"
    t.string "utm_medium"
    t.string "utm_term"
    t.string "utm_content"
    t.string "utm_campaign"
    t.datetime "started_at"
    t.index ["user_id"], name: "index_visits_on_user_id"
    t.index ["visit_token"], name: "index_visits_on_visit_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "activities", "cases"
  add_foreign_key "answers", "questions"
  add_foreign_key "answers", "quizzes"
  add_foreign_key "answers", "readers"
  add_foreign_key "answers", "submissions"
  add_foreign_key "cards", "pages"
  add_foreign_key "comment_threads", "cards"
  add_foreign_key "comment_threads", "cases"
  add_foreign_key "comment_threads", "forums"
  add_foreign_key "comment_threads", "readers"
  add_foreign_key "comments", "comment_threads"
  add_foreign_key "comments", "readers"
  add_foreign_key "communities", "groups"
  add_foreign_key "deployments", "groups"
  add_foreign_key "deployments", "quizzes"
  add_foreign_key "edgenotes", "cards"
  add_foreign_key "editorships", "readers", column: "editor_id"
  add_foreign_key "enrollments", "readers"
  add_foreign_key "forums", "communities"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "readers"
  add_foreign_key "invitations", "communities"
  add_foreign_key "invitations", "readers"
  add_foreign_key "locks", "readers"
  add_foreign_key "managerships", "libraries"
  add_foreign_key "managerships", "readers", column: "manager_id"
  add_foreign_key "questions", "quizzes"
  add_foreign_key "readers", "communities", column: "active_community_id"
  add_foreign_key "reading_list_items", "reading_lists"
  add_foreign_key "reading_list_saves", "readers"
  add_foreign_key "reading_list_saves", "reading_lists"
  add_foreign_key "reading_lists", "readers"
  add_foreign_key "spotlight_acknowledgements", "readers"
  add_foreign_key "submissions", "quizzes"
  add_foreign_key "submissions", "readers"
  add_foreign_key "taggings", "tags"
end
