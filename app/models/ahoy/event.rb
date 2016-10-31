module Ahoy
  class Event < ActiveRecord::Base
    include Ahoy::Properties

    self.table_name = "ahoy_events"

    belongs_to :visit
    belongs_to :user, class_name: "Reader", optional: true

    scope :interesting, -> { joins(:user).where "readers.id NOT IN (SELECT reader_id FROM readers_roles JOIN roles ON role_id = roles.id WHERE roles.name = 'invisible')" }

  end
end
