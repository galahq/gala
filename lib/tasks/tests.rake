# frozen_string_literal: true

namespace :test do
  desc 'Run RSpec without feature specs'
  task unit: :environment do
    env = "RAILS_ENV=test"
    system(
      "#{env} bundle exec rspec --exclude-pattern='**/features/*_spec.rb'"
    )
  end
end
