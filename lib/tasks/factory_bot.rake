# frozen_string_literal: true

require 'uri'

namespace :factory_bot do
  LOCAL_TEST_DB_URL = 'postgres://gala:alpine@localhost:5432/gala_test'

  desc 'Verify that all FactoryBot factories are valid'
  task lint: :environment do
    if Rails.env.test?
      ActiveRecord::Base.establish_connection(:test)
      ActiveRecord::Base.transaction do
        FactoryBot.lint
        raise ActiveRecord::Rollback
      end
    else
      env = { 'RAILS_ENV' => 'test' }
      if needs_local_db_override?(ENV['DATABASE_URL'])
        env['DATABASE_URL'] = LOCAL_TEST_DB_URL
      end
      system(env, 'bundle', 'exec', 'rake', 'factory_bot:lint')
      raise if $CHILD_STATUS.exitstatus.nonzero?
    end
  end

  def needs_local_db_override?(url)
    return false if ENV['DOCKER_DEV'].present?
    return false if url.blank?

    URI.parse(url).host == 'db'
  rescue URI::InvalidURIError
    false
  end
end
