# frozen_string_literal: true

module ApplicationHelper
  def parent_layout(layout)
    @view_flow.set(:layout, output_buffer)
    self.output_buffer = render(file: "layouts/#{layout}")
  end

  # Helpers for content_for blocks in view layouts
  %i[headline background_image_url email_footer].each do |key|
    ApplicationHelper.send(:define_method, key) do |val|
      content_for(key) { val }
    end
  end

  def current_user
    current_reader || AnonymousUser.new
  end

  def devise_mapping
    Devise.mappings[:reader]
  end

  def resource_name
    devise_mapping.name
  end

  def resource_class
    devise_mapping.to
  end

  def locale_names
    I18n.available_locales.map do |l|
      [I18n.t('name', locale: l), l]
    end
  end

  def one_liner(text)
    # Removes newlines
    text.delete("\n")
  end

  def md_button_to(text, href)
    raw <<~MD
      <span class="o-button">[#{text}](#{href})</span>
MD
  end

  def markdown(md)
    redcarpet = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
    redcarpet.render md
  end

  # Generates normalized objects where each element is keyed by its id. Because
  # partial lookup is expensive and jbuilder is slow, we’re caching each
  # element. Make sure that the elements are touched by their descendents, if
  # necessary.
  #
  # @param json the configuration object for a jbuilder template
  # @param collections [Hash<Symbol, Enumerable<#to_param>>] a hash where values are the collections to be normalized and keys are the property names to assign the normalized objects to
  def by_id(json, collections)
    collections.each do |key, collection|
      json.set! key do
        collection.each do |element|
          json.set! element.to_param do
            json.cache! element do
              json.partial! element
            end
          end
        end
      end
    end
  end
end
