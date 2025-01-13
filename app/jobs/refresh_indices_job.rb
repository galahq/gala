# Frozen_string_literal: true

# Refresh all indices after a case is created
class RefreshIndicesJob < ApplicationJob
  queue_as :default

  def perform
    Rails.application.load_tasks
    ::Rake::Task['indices:refresh'].invoke
  end
end
