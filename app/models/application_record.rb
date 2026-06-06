# frozen_string_literal: true

require Rails.root.join('vendor/ruby/gala_list_ordering')

# @abstract
class ApplicationRecord < ActiveRecord::Base
  include GalaListOrdering

  self.abstract_class = true
end
