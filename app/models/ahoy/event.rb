# frozen_string_literal: true

module Ahoy
  # A single event in the log of user behavior. An event is `interesting`
  # (included in {.interesting}) if it is made by a {Reader} that does not have
  # the role `:invisible`. This allows us to remove the editors’ behavior from
  # the statistics we collect about the use of cases.
  #
  # {include:file:docs/trackable_event_schema.md}
  #
  # @attr name [String]
  # @attr properties [Hash] Event details following the trackable event schema
  class Event < ActiveRecord::Base
    include Ahoy::Properties

    self.table_name = 'ahoy_events'

    belongs_to :visit, optional: true
    belongs_to :user, class_name: 'Reader', optional: true

    before_validation :populate_case_id

    scope :interesting, -> { joins(:user).where <<~SQL.squish }
      readers.id NOT IN
        (SELECT reader_id
           FROM readers_roles
                JOIN roles ON role_id = roles.id
          WHERE roles.name = 'invisible')
    SQL

    # Find the events created through use of a given case.
    # @param kase [Case]
    # @return [ActiveRecord::Relation<Ahoy::Event>]
    def self.for_case(kase)
      where_properties case_slug: kase.slug
    end

    private

    def populate_case_id
      return if case_id.present?

      slug = (properties || {})['case_slug']
      return if slug.blank?

      self.case_id = Case.where(slug: slug).limit(1).pick(:id)
    end
  end
end
