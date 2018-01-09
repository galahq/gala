# frozen_string_literal: true

# A session of use of the platform by a reader.
class Visit < ActiveRecord::Base
  has_many :ahoy_events, class_name: 'Ahoy::Event'
  belongs_to :user, class_name: 'Reader', optional: true
end
