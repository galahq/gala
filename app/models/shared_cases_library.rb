# frozen_string_literal: true

# Null object for {Library}. Any {Case} not in a library is a user-submitted
# case with no pedigree. It could be quite good, or written by a prominent
# researcher, so we don’t want to imply these cases are less-than in any way.
class SharedCasesLibrary
  include Singleton

  attr_reader :id, :slug, :url, :logo_url, :background_color, :foreground_color

  def initialize
    @id = nil
    @slug = 'shared'
    @url = ''
    @logo_url = ActionController::Base
                .helpers.asset_path('shared-cases-library.svg')
    @background_color = 'rgba(255, 255, 255, 0.3)'
    @foreground_color = 'rgba(255, 255, 255, 0.4)'
  end

  def name
    I18n.t 'activerecord.models.shared_cases_library'
  end

  def description
    I18n.t 'activerecord.attributes.shared_cases_library.description'
  end

  def to_partial_path
    'libraries/library'
  end
end
