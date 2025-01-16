# frozen_string_literal: true

namespace :test do
  desc 'Run RSpec without feature specs'
  task unit: :environment do
    ENV['RAILS_ENV'] = 'test'
    require 'rspec/core/rake_task'

    RSpec::Core::RakeTask.new(:unit_specs) do |t|
      t.exclude_pattern = '**/features/*_spec.rb'
    end

    Rake::Task['unit_specs'].invoke
  end
end
