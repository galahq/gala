# frozen_string_literal: true

# @abstract
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end
