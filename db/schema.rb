# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171030185254) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "activities", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "position"
    t.string "icon_slug", default: "activity-text"
    t.jsonb "title", default: ""
    t.jsonb "description", default: ""
    t.jsonb "pdf_url", default: ""
    t.index ["case_id"], name: "index_activities_on_case_id"
  end

  create_table "ahoy_events", id: :serial, force: :cascade do |t|
    t.integer "visit_id"
    t.integer "user_id"
    t.string "name"
    t.jsonb "properties"
    t.datetime "time"
    t.index "properties jsonb_path_ops", name: "index_ahoy_events_on_properties_jsonb_path_ops", using: :gin
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time"
    t.index ["user_id", "name"], name: "index_ahoy_events_on_user_id_and_name"
    t.index ["visit_id", "name"], name: "index_ahoy_events_on_visit_id_and_name"
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
    t.index ["question_id"], name: "index_answers_on_question_id"
    t.index ["quiz_id"], name: "index_answers_on_quiz_id"
    t.index ["reader_id"], name: "index_answers_on_reader_id"
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
    t.jsonb "content", default: ""
    t.jsonb "raw_content", default: ""
    t.index ["case_id"], name: "index_cards_on_case_id"
    t.index ["element_type", "element_id"], name: "index_cards_on_element_type_and_element_id"
    t.index ["page_id"], name: "index_cards_on_page_id"
  end

  create_table "case_elements", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.string "element_type"
    t.integer "element_id"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id"], name: "index_case_elements_on_case_id"
    t.index ["element_type", "element_id"], name: "index_case_elements_on_element_type_and_element_id"
  end

  create_table "cases", id: :serial, force: :cascade do |t|
    t.text "slug", null: false
    t.string "authors", default: [], array: true
    t.text "tags", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cover_url"
    t.text "short_title"
    t.text "photo_credit"
    t.boolean "commentable"
    t.jsonb "title", default: ""
    t.jsonb "summary", default: ""
    t.jsonb "narrative", default: ""
    t.jsonb "translators", default: ""
    t.jsonb "kicker", default: ""
    t.jsonb "dek", default: ""
    t.jsonb "learning_objectives"
    t.jsonb "audience"
    t.jsonb "classroom_timeline"
    t.datetime "published_at"
    t.datetime "featured_at"
    t.float "latitude"
    t.float "longitude"
    t.float "zoom"
    t.bigint "library_id"
    t.jsonb "acknowledgements"
    t.index ["library_id"], name: "index_cases_on_library_id"
    t.index ["slug"], name: "index_cases_on_slug", unique: true
    t.index ["tags"], name: "index_cases_on_tags", using: :gin
  end

  create_table "comment_threads", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "start"
    t.integer "length"
    t.integer "block_index"
    t.string "original_highlight_text"
    t.string "locale"
    t.integer "card_id"
    t.integer "reader_id"
    t.integer "forum_id"
    t.integer "comments_count"
    t.index ["card_id"], name: "index_comment_threads_on_card_id"
    t.index ["case_id"], name: "index_comment_threads_on_case_id"
    t.index ["forum_id"], name: "index_comment_threads_on_forum_id"
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
    t.index ["group_id"], name: "index_communities_on_group_id"
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
    t.jsonb "caption", default: ""
    t.jsonb "content", default: ""
    t.jsonb "instructions", default: ""
    t.jsonb "image_url", default: ""
    t.jsonb "website_url", default: ""
    t.jsonb "embed_code", default: ""
    t.jsonb "photo_credit", default: ""
    t.jsonb "pdf_url", default: ""
    t.jsonb "pull_quote", default: ""
    t.jsonb "attribution", default: ""
    t.jsonb "call_to_action", default: ""
    t.jsonb "audio_url", default: ""
    t.jsonb "youtube_slug", default: ""
    t.string "alt_text"
    t.index ["card_id"], name: "index_edgenotes_on_card_id"
    t.index ["case_id"], name: "index_edgenotes_on_case_id"
    t.index ["slug"], name: "index_edgenotes_on_slug", unique: true
  end

  create_table "enrollments", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status", default: 0
    t.integer "active_group_id"
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

  create_table "group_memberships", id: :serial, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "group_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.index ["slug"], name: "index_libraries_on_slug", unique: true
  end

  create_table "pages", id: :serial, force: :cascade do |t|
    t.integer "position"
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "title", default: ""
    t.index ["case_id"], name: "index_pages_on_case_id"
  end

  create_table "podcasts", id: :serial, force: :cascade do |t|
    t.integer "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "position"
    t.string "artwork_url"
    t.text "photo_credit"
    t.jsonb "title", default: ""
    t.jsonb "audio_url", default: ""
    t.jsonb "description", default: ""
    t.jsonb "credits", default: ""
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
    t.index ["active_community_id"], name: "index_readers_on_active_community_id"
    t.index ["confirmation_token"], name: "index_readers_on_confirmation_token", unique: true
    t.index ["email"], name: "index_readers_on_email", unique: true
    t.index ["reset_password_token"], name: "index_readers_on_reset_password_token", unique: true
  end

  create_table "readers_roles", id: false, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "role_id"
    t.index ["reader_id", "role_id"], name: "index_readers_roles_on_reader_id_and_role_id"
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

  add_foreign_key "activities", "cases"
  add_foreign_key "answers", "questions"
  add_foreign_key "answers", "quizzes"
  add_foreign_key "answers", "readers"
  add_foreign_key "cards", "cases"
  add_foreign_key "cards", "pages"
  add_foreign_key "case_elements", "cases"
  add_foreign_key "comment_threads", "cards"
  add_foreign_key "comment_threads", "cases"
  add_foreign_key "comment_threads", "forums"
  add_foreign_key "comment_threads", "readers"
  add_foreign_key "comments", "comment_threads"
  add_foreign_key "comments", "readers"
  add_foreign_key "communities", "groups"
  add_foreign_key "deployments", "cases"
  add_foreign_key "deployments", "groups"
  add_foreign_key "deployments", "quizzes"
  add_foreign_key "edgenotes", "cards"
  add_foreign_key "enrollments", "cases"
  add_foreign_key "enrollments", "readers"
  add_foreign_key "forums", "cases"
  add_foreign_key "forums", "communities"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "readers"
  add_foreign_key "invitations", "communities"
  add_foreign_key "invitations", "readers"
  add_foreign_key "pages", "cases"
  add_foreign_key "podcasts", "cases"
  add_foreign_key "questions", "quizzes"
  add_foreign_key "quizzes", "cases"
  add_foreign_key "readers", "communities", column: "active_community_id"
end
