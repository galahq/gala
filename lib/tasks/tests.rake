# frozen_string_literal: true

namespace :test do
  desc 'Run RSpec without feature specs'
  task unit: :environment do
    system(
      "RAILS_ENV=test bundle exec rspec --exclude-pattern='**/features/*_spec.rb'"
    )
  end
end
