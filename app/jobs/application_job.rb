# frozen_string_literal: true

# @abstract
class ApplicationJob < ActiveJob::Base
  queue_as :default
end
