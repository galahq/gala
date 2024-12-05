#!/bin/bash -e

export PGPASSWORD='alpine'

sql_dump="/Users/nathanpapes/dumps/gala/42a251a5-f400-4e69-b6f6-99d023f94c3c"

pg_restore --clean --no-owner --no-privileges -h localhost -p 5432 -U gala -d gala "${sql_dump}"

bundle exec rails runner <<~RUBY
  User.find_each do |user|
    new_email = "#{user.email}-deactivated"
    user.update_column(:email, new_email)
  end
RUBY