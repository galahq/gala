# encoding: UTF-8
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

ActiveRecord::Schema.define(version: 20160516153452) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"

  create_table "cases", force: :cascade do |t|
    t.boolean  "published",      default: false
    t.hstore   "title_i18n"
    t.text     "slug",                           null: false
    t.string   "authors",        default: [],                 array: true
    t.hstore   "summary_i18n"
    t.text     "tags",           default: [],                 array: true
    t.hstore   "narrative_i18n"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.string   "cover_url"
    t.index ["slug"], name: "index_cases_on_slug", unique: true, using: :btree
    t.index ["tags"], name: "index_cases_on_tags", using: :gin
  end

  create_table "edgenotes", force: :cascade do |t|
    t.hstore   "caption_i18n"
    t.string   "format"
    t.string   "thumbnail_url"
    t.hstore   "content_i18n"
    t.integer  "case_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.index ["case_id"], name: "index_edgenotes_on_case_id", using: :btree
  end

  create_table "readers", force: :cascade do |t|
    t.text     "name"
    t.text     "image_url"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.string   "provider"
    t.string   "uid"
    t.text     "authentication_token"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["authentication_token"], name: "index_readers_on_authentication_token", unique: true, using: :btree
    t.index ["email"], name: "index_readers_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_readers_on_reset_password_token", unique: true, using: :btree
  end

end
