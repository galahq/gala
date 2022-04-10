# frozen_string_literal: true

# Provides helper functions to access the standard translations of flash
# messages.
#
# @example
#   I18n.locale = :en
#   class CaseController ...
#
#   successfully_created('case')
#   # => 'Case successfully created'
#
module TranslatedFlashMessages
  ACTION_NAMES = %i[created updated destroyed copied].freeze

  extend ActiveSupport::Concern

  included do
    ACTION_NAMES.map do |action|
      define_method(
        :"successfully_#{action}"
      ) do |resource = inferred_resource_name|
        I18n.t "activerecord.persistance.messages.#{action}",
               model: I18n.t("activerecord.models.#{keyify resource}"),
               default: "#{resource} successfully #{action}."
      end
      private :"successfully_#{action}"
    end
  end

  private

  def inferred_resource_name
    self.class.name.delete_suffix('Controller').singularize
  end

  def keyify(name)
    name.to_s.underscore.tr('/', '.')
  end
end
