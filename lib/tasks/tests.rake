# frozen_string_literal: true

namespace :test do
  desc 'Run RSpec'
  task unit: :environment do
    ENV['RAILS_ENV'] = 'test'
    require 'rspec/core/rake_task'

    RSpec::Core::RakeTask.new(:unit_specs)

    Rake::Task['unit_specs'].invoke
  end
end
