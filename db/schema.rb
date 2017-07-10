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

ActiveRecord::Schema.define(version: 20170707160226) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "activities", force: :cascade do |t|
    t.integer  "case_id"
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.integer  "position"
    t.string   "icon_slug",   default: "activity-text"
    t.jsonb    "title",       default: ""
    t.jsonb    "description", default: ""
    t.jsonb    "pdf_url",     default: ""
    t.index ["case_id"], name: "index_activities_on_case_id", using: :btree
  end

  create_table "ahoy_events", force: :cascade do |t|
    t.integer  "visit_id"
    t.integer  "user_id"
    t.string   "name"
    t.jsonb    "properties"
    t.datetime "time"
    t.index "properties jsonb_path_ops", name: "index_ahoy_events_on_properties_jsonb_path_ops", using: :gin
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time", using: :btree
    t.index ["user_id", "name"], name: "index_ahoy_events_on_user_id_and_name", using: :btree
    t.index ["visit_id", "name"], name: "index_ahoy_events_on_visit_id_and_name", using: :btree
  end

  create_table "answers", force: :cascade do |t|
    t.integer  "question_id"
    t.integer  "quiz_id"
    t.integer  "reader_id"
    t.string   "content"
    t.boolean  "correct"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.decimal  "case_completion"
    t.index ["question_id"], name: "index_answers_on_question_id", using: :btree
    t.index ["quiz_id"], name: "index_answers_on_quiz_id", using: :btree
    t.index ["reader_id"], name: "index_answers_on_reader_id", using: :btree
  end

  create_table "authentication_strategies", force: :cascade do |t|
    t.string   "provider"
    t.string   "uid"
    t.integer  "reader_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reader_id"], name: "index_authentication_strategies_on_reader_id", using: :btree
    t.index ["uid"], name: "index_authentication_strategies_on_uid", where: "((provider)::text = 'lti'::text)", using: :btree
  end

  create_table "cards", force: :cascade do |t|
    t.integer  "position"
    t.integer  "page_id"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.boolean  "solid",        default: true
    t.string   "element_type"
    t.integer  "element_id"
    t.integer  "case_id"
    t.jsonb    "content",      default: ""
    t.jsonb    "raw_content",  default: ""
    t.index ["case_id"], name: "index_cards_on_case_id", using: :btree
    t.index ["element_type", "element_id"], name: "index_cards_on_element_type_and_element_id", using: :btree
    t.index ["page_id"], name: "index_cards_on_page_id", using: :btree
  end

  create_table "case_elements", force: :cascade do |t|
    t.integer  "case_id"
    t.string   "element_type"
    t.integer  "element_id"
    t.integer  "position"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.index ["case_id"], name: "index_case_elements_on_case_id", using: :btree
    t.index ["element_type", "element_id"], name: "index_case_elements_on_element_type_and_element_id", using: :btree
  end

  create_table "cases", force: :cascade do |t|
    t.boolean  "published",           default: false
    t.text     "slug",                                null: false
    t.string   "authors",             default: [],                 array: true
    t.text     "tags",                default: [],                 array: true
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "cover_url"
    t.date     "publication_date"
    t.integer  "catalog_position",    default: 0,     null: false
    t.text     "short_title"
    t.text     "photo_credit"
    t.boolean  "commentable"
    t.jsonb    "title",               default: ""
    t.jsonb    "summary",             default: ""
    t.jsonb    "narrative",           default: ""
    t.jsonb    "translators",         default: ""
    t.jsonb    "kicker",              default: ""
    t.jsonb    "dek",                 default: ""
    t.jsonb    "learning_objectives"
    t.jsonb    "audience"
    t.jsonb    "classroom_timeline"
    t.index ["slug"], name: "index_cases_on_slug", unique: true, using: :btree
    t.index ["tags"], name: "index_cases_on_tags", using: :gin
  end

  create_table "comment_threads", force: :cascade do |t|
    t.integer  "case_id"
    t.integer  "group_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.integer  "start"
    t.integer  "length"
    t.integer  "block_index"
    t.string   "original_highlight_text"
    t.string   "locale"
    t.integer  "card_id"
    t.integer  "reader_id"
    t.index ["card_id"], name: "index_comment_threads_on_card_id", using: :btree
    t.index ["case_id"], name: "index_comment_threads_on_case_id", using: :btree
    t.index ["group_id"], name: "index_comment_threads_on_group_id", using: :btree
    t.index ["reader_id"], name: "index_comment_threads_on_reader_id", using: :btree
  end

  create_table "comments", force: :cascade do |t|
    t.integer  "reader_id"
    t.integer  "comment_thread_id"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.integer  "position"
    t.jsonb    "content",           default: ""
    t.index ["comment_thread_id"], name: "index_comments_on_comment_thread_id", using: :btree
    t.index ["reader_id"], name: "index_comments_on_reader_id", using: :btree
  end

  create_table "deployments", force: :cascade do |t|
    t.integer  "case_id"
    t.integer  "group_id"
    t.integer  "quiz_id"
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "answers_needed", default: 1
    t.index ["case_id"], name: "index_deployments_on_case_id", using: :btree
    t.index ["group_id"], name: "index_deployments_on_group_id", using: :btree
    t.index ["quiz_id"], name: "index_deployments_on_quiz_id", using: :btree
  end

  create_table "edgenotes", force: :cascade do |t|
    t.string   "format"
    t.string   "thumbnail_url"
    t.integer  "case_id"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.text     "slug",                        null: false
    t.integer  "card_id"
    t.integer  "style",          default: 0
    t.jsonb    "caption",        default: ""
    t.jsonb    "content",        default: ""
    t.jsonb    "instructions",   default: ""
    t.jsonb    "image_url",      default: ""
    t.jsonb    "website_url",    default: ""
    t.jsonb    "embed_code",     default: ""
    t.jsonb    "photo_credit",   default: ""
    t.jsonb    "pdf_url",        default: ""
    t.jsonb    "pull_quote",     default: ""
    t.jsonb    "attribution",    default: ""
    t.jsonb    "call_to_action", default: ""
    t.jsonb    "audio_url",      default: ""
    t.jsonb    "youtube_slug",   default: ""
    t.index ["card_id"], name: "index_edgenotes_on_card_id", using: :btree
    t.index ["case_id"], name: "index_edgenotes_on_case_id", using: :btree
    t.index ["slug"], name: "index_edgenotes_on_slug", unique: true, using: :btree
  end

  create_table "enrollments", force: :cascade do |t|
    t.integer  "reader_id"
    t.integer  "case_id"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.integer  "status",     default: 0
    t.index ["case_id"], name: "index_enrollments_on_case_id", using: :btree
    t.index ["reader_id"], name: "index_enrollments_on_reader_id", using: :btree
  end

  create_table "group_memberships", force: :cascade do |t|
    t.integer  "reader_id"
    t.integer  "group_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_group_memberships_on_group_id", using: :btree
    t.index ["reader_id"], name: "index_group_memberships_on_reader_id", using: :btree
  end

  create_table "groups", force: :cascade do |t|
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "context_id"
    t.jsonb    "name",       default: ""
    t.index ["context_id"], name: "index_groups_on_context_id", using: :btree
  end

  create_table "pages", force: :cascade do |t|
    t.integer  "position"
    t.integer  "case_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.jsonb    "title",      default: ""
    t.index ["case_id"], name: "index_pages_on_case_id", using: :btree
  end

  create_table "podcasts", force: :cascade do |t|
    t.integer  "case_id"
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.integer  "position"
    t.string   "artwork_url"
    t.text     "photo_credit"
    t.jsonb    "title",        default: ""
    t.jsonb    "audio_url",    default: ""
    t.jsonb    "description",  default: ""
    t.jsonb    "credits",      default: ""
    t.index ["case_id"], name: "index_podcasts_on_case_id", using: :btree
  end

  create_table "questions", force: :cascade do |t|
    t.integer  "quiz_id"
    t.text     "correct_answer"
    t.string   "options",        default: [],              array: true
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.jsonb    "content",        default: ""
    t.index ["quiz_id"], name: "index_questions_on_quiz_id", using: :btree
  end

  create_table "quizzes", force: :cascade do |t|
    t.integer  "case_id"
    t.integer  "template_id"
    t.boolean  "customized"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "author_id"
    t.string   "lti_uid"
    t.index ["author_id"], name: "index_quizzes_on_author_id", using: :btree
    t.index ["case_id"], name: "index_quizzes_on_case_id", using: :btree
    t.index ["lti_uid"], name: "index_quizzes_on_lti_uid", using: :btree
    t.index ["template_id"], name: "index_quizzes_on_template_id", using: :btree
  end

  create_table "readers", force: :cascade do |t|
    t.text     "name"
    t.text     "image_url"
    t.string   "email",                    default: "",   null: false
    t.string   "encrypted_password",       default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",            default: 0,    null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.text     "initials"
    t.text     "locale"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.boolean  "created_password",         default: true
    t.boolean  "send_reply_notifications", default: true
    t.index ["confirmation_token"], name: "index_readers_on_confirmation_token", unique: true, using: :btree
    t.index ["email"], name: "index_readers_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_readers_on_reset_password_token", unique: true, using: :btree
  end

  create_table "readers_roles", id: false, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "role_id"
    t.index ["reader_id", "role_id"], name: "index_readers_roles_on_reader_id_and_role_id", using: :btree
  end

  create_table "reply_notifications", force: :cascade do |t|
    t.integer "reader_id"
    t.integer "notifier_id"
    t.integer "comment_id"
    t.integer "comment_thread_id"
    t.integer "case_id"
    t.integer "page_id"
    t.integer "card_id"
    t.index ["reader_id"], name: "index_reply_notifications_on_reader_id", using: :btree
  end

  create_table "roles", force: :cascade do |t|
    t.string   "name"
    t.string   "resource_type"
    t.integer  "resource_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id", using: :btree
    t.index ["name"], name: "index_roles_on_name", using: :btree
  end

  create_table "visits", force: :cascade do |t|
    t.string   "visit_token"
    t.string   "visitor_token"
    t.string   "ip"
    t.text     "user_agent"
    t.text     "referrer"
    t.text     "landing_page"
    t.integer  "user_id"
    t.string   "referring_domain"
    t.string   "search_keyword"
    t.string   "browser"
    t.string   "os"
    t.string   "device_type"
    t.integer  "screen_height"
    t.integer  "screen_width"
    t.string   "country"
    t.string   "region"
    t.string   "city"
    t.string   "postal_code"
    t.decimal  "latitude"
    t.decimal  "longitude"
    t.string   "utm_source"
    t.string   "utm_medium"
    t.string   "utm_term"
    t.string   "utm_content"
    t.string   "utm_campaign"
    t.datetime "started_at"
    t.index ["user_id"], name: "index_visits_on_user_id", using: :btree
    t.index ["visit_token"], name: "index_visits_on_visit_token", unique: true, using: :btree
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
  add_foreign_key "comment_threads", "groups"
  add_foreign_key "comment_threads", "readers"
  add_foreign_key "comments", "comment_threads"
  add_foreign_key "comments", "readers"
  add_foreign_key "deployments", "cases"
  add_foreign_key "deployments", "groups"
  add_foreign_key "deployments", "quizzes"
  add_foreign_key "edgenotes", "cards"
  add_foreign_key "enrollments", "cases"
  add_foreign_key "enrollments", "readers"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "readers"
  add_foreign_key "pages", "cases"
  add_foreign_key "podcasts", "cases"
  add_foreign_key "questions", "quizzes"
  add_foreign_key "quizzes", "cases"
end
