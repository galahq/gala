# frozen_string_literal: true

# Null object for {Library}. Any {Case} not in a library is a user-submitted
# case with no pedigree. It could be quite good, or written by a prominent
# researcher, so we don’t want to imply these cases are less-than in any way.
class SharedCasesLibrary
  include Singleton
  include Serializable
  extend ActiveModel::Naming

  attr_reader :id, :slug, :url, :background_color, :foreground_color

  serialize_with LibrarySerializer

  def self.policy_class
    LibraryPolicy
  end

  def initialize
    @id = nil
    @slug = 'shared'
    @url = ''
    @background_color = 'rgba(255, 255, 255, 0.3)'
    @foreground_color = 'rgba(255, 255, 255, 0.4)'
  end

  def name
    I18n.t 'activerecord.models.shared_cases_library'
  end

  def description
    I18n.t 'activerecord.attributes.shared_cases_library.description'
  end

  def logo_url
    @logo_url ||=
      ActionController::Base.helpers.asset_path('shared-cases-library.svg')
  end

  def to_param
    nil
  end

  def to_model
    self
  end

  def to_partial_path
    'libraries/library'
  end

  def persisted?
    false
  end

  def decorate(options)
    LibraryDecorator.new self, options
  end

  def managers
    Reader.all
  end

  def requests
    CaseLibraryRequest.none
  end

  def cases
    Case.shared
  end
end
