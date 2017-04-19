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

ActiveRecord::Schema.define(version: 20170419172037) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"

  create_table "activities", force: :cascade do |t|
    t.hstore   "title_i18n"
    t.hstore   "description_i18n"
    t.hstore   "pdf_url_i18n"
    t.integer  "case_id"
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.integer  "position"
    t.string   "icon_slug",        default: "activity-text"
    t.index ["case_id"], name: "index_activities_on_case_id", using: :btree
  end

  create_table "ahoy_events", force: :cascade do |t|
    t.integer  "visit_id"
    t.integer  "user_id"
    t.string   "name"
    t.jsonb    "properties"
    t.datetime "time"
    t.index ["name", "time"], name: "index_ahoy_events_on_name_and_time", using: :btree
    t.index ["user_id", "name"], name: "index_ahoy_events_on_user_id_and_name", using: :btree
    t.index ["visit_id", "name"], name: "index_ahoy_events_on_visit_id_and_name", using: :btree
  end

  create_table "authentication_strategies", force: :cascade do |t|
    t.string   "provider"
    t.string   "uid"
    t.integer  "reader_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reader_id"], name: "index_authentication_strategies_on_reader_id", using: :btree
  end

  create_table "cards", force: :cascade do |t|
    t.integer  "position"
    t.hstore   "content_i18n"
    t.integer  "page_id"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.boolean  "solid",            default: true
    t.hstore   "raw_content_i18n"
    t.string   "element_type"
    t.integer  "element_id"
    t.integer  "case_id"
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
    t.boolean  "published",        default: false
    t.hstore   "title_i18n"
    t.text     "slug",                                    null: false
    t.string   "authors",          default: [],                        array: true
    t.hstore   "summary_i18n"
    t.text     "tags",             default: [],                        array: true
    t.hstore   "narrative_i18n"
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.string   "cover_url"
    t.date     "publication_date"
    t.integer  "catalog_position", default: 0,            null: false
    t.text     "short_title"
    t.hstore   "translators_i18n", default: {"en"=>"[]"}, null: false
    t.hstore   "kicker_i18n"
    t.hstore   "dek_i18n"
    t.text     "photo_credit"
    t.boolean  "commentable"
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
    t.hstore   "content_i18n"
    t.integer  "reader_id"
    t.integer  "comment_thread_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.integer  "position"
    t.index ["comment_thread_id"], name: "index_comments_on_comment_thread_id", using: :btree
    t.index ["reader_id"], name: "index_comments_on_reader_id", using: :btree
  end

  create_table "edgenotes", force: :cascade do |t|
    t.hstore   "caption_i18n"
    t.string   "format"
    t.string   "thumbnail_url"
    t.hstore   "content_i18n"
    t.integer  "case_id"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.text     "slug",                            null: false
    t.integer  "card_id"
    t.hstore   "instructions_i18n"
    t.hstore   "image_url_i18n"
    t.hstore   "website_url_i18n"
    t.hstore   "embed_code_i18n"
    t.hstore   "photo_credit_i18n"
    t.hstore   "pdf_url_i18n"
    t.integer  "style",               default: 0
    t.hstore   "pull_quote_i18n"
    t.hstore   "attribution_i18n"
    t.hstore   "call_to_action_i18n"
    t.hstore   "audio_url_i18n"
    t.hstore   "youtube_slug_i18n"
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
    t.hstore   "name_i18n"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "context_id"
    t.index ["context_id"], name: "index_groups_on_context_id", using: :btree
  end

  create_table "notifications", force: :cascade do |t|
    t.boolean  "email_sent"
    t.boolean  "read"
    t.integer  "reader_id"
    t.integer  "category"
    t.jsonb    "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reader_id"], name: "index_notifications_on_reader_id", using: :btree
  end

  create_table "pages", force: :cascade do |t|
    t.integer  "position"
    t.hstore   "title_i18n"
    t.integer  "case_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["case_id"], name: "index_pages_on_case_id", using: :btree
  end

  create_table "podcasts", force: :cascade do |t|
    t.hstore   "title_i18n"
    t.hstore   "audio_url_i18n"
    t.hstore   "description_i18n"
    t.integer  "case_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.integer  "position"
    t.string   "artwork_url"
    t.hstore   "credits_i18n"
    t.text     "photo_credit"
    t.index ["case_id"], name: "index_podcasts_on_case_id", using: :btree
  end

  create_table "readers", force: :cascade do |t|
    t.text     "name"
    t.text     "image_url"
    t.string   "email",                  default: "",   null: false
    t.string   "encrypted_password",     default: ""
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,    null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.text     "initials"
    t.text     "locale"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.boolean  "created_password",       default: true
    t.index ["confirmation_token"], name: "index_readers_on_confirmation_token", unique: true, using: :btree
    t.index ["email"], name: "index_readers_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_readers_on_reset_password_token", unique: true, using: :btree
  end

  create_table "readers_roles", id: false, force: :cascade do |t|
    t.integer "reader_id"
    t.integer "role_id"
    t.index ["reader_id", "role_id"], name: "index_readers_roles_on_reader_id_and_role_id", using: :btree
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
  add_foreign_key "cards", "cases"
  add_foreign_key "cards", "pages"
  add_foreign_key "case_elements", "cases"
  add_foreign_key "comment_threads", "cards"
  add_foreign_key "comment_threads", "cases"
  add_foreign_key "comment_threads", "groups"
  add_foreign_key "comment_threads", "readers"
  add_foreign_key "comments", "comment_threads"
  add_foreign_key "comments", "readers"
  add_foreign_key "edgenotes", "cards"
  add_foreign_key "enrollments", "cases"
  add_foreign_key "enrollments", "readers"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "readers"
  add_foreign_key "notifications", "readers"
  add_foreign_key "pages", "cases"
  add_foreign_key "podcasts", "cases"
end
