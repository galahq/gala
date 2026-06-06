# frozen_string_literal: true

# Helper methods available in every view
module ApplicationHelper
  def parent_layout(layout)
    @view_flow.set(:layout, output_buffer)
    self.output_buffer = render template: "layouts/#{layout}"
  end

  def collected_javascript_bundle_tags(*default_names, **options)
    entry_name = default_names.first || 'application'

    javascript_include_tag(
      "/assets/#{vite_javascript_entry_name(entry_name)}",
      **{ defer: true, type: 'module', skip_pipeline: true }.merge(options)
    )
  end

  def collected_stylesheet_bundle_tags(*_default_names, **options)
    safe_stylesheet_bundle_tag('javascript-application', **options)
  end

  def safe_stylesheet_bundle_tag(name, **options)
    if (entry_name = vite_stylesheet_entry_name(name))
      return stylesheet_link_tag("/assets/#{entry_name}", **{ skip_pipeline: true }.merge(options))
    end

    stylesheet_link_tag(name, **options)
  rescue Propshaft::MissingAssetError
    nil
  end

  def vite_javascript_entry_name(name)
    Dir.glob(Rails.root.join('app/assets/builds', "#{name}-*.digested.js").to_s)
       .max_by { |path| File.mtime(path) }
       &.then { |path| File.basename(path) } || name
  end

  def vite_stylesheet_entry_name(name)
    Dir.glob(Rails.root.join('app/assets/builds', "#{name}-*.digested.css").to_s)
       .max_by { |path| File.mtime(path) }
       &.then { |path| File.basename(path) }
  end

  # Helpers for content_for blocks in view layouts
  %i[headline background_image_url email_footer].each do |key|
    ApplicationHelper.send(:define_method, key) do |val|
      content_for(key) { val }
    end
  end

  def current_user
    Current.user || current_reader || AnonymousUser.new
  rescue Devise::MissingWarden
    AnonymousUser.new
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

  def case_locale
    @case&.locale
  end

  def in_locale(locale = 'en')
    I18n.locale == locale || @case&.locale == locale
  end

  def locale_names(locales = Translation.languages)
    locales.map do |l|
      [Translation.language_name(l), l]
    end
  end

  def one_liner(text)
    # Removes newlines
    text.delete("\n")
  end

  def md_button_to(text, href)
    raw(markdown("<span class='o-button'>[#{text}](#{href})</span>"))
  end

  def markdown(md)
    GalaMarkdown.render(md)
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
            json.cache! [element, I18n.locale] do
              json.partial! element
            end
          end
        end
      end
    end
  end

  def  my_cases_nav_button_text
    if current_user.editorships.any?
      t 'my_cases.index.my_cases'
    else
      t 'cases.new.create_a_case'
    end
  end

  def deployments_nav_button_text
    if current_user.deployments.any?
      t 'deployments.index.my_deployments'
    else
      t 'deployments.index.deploy_a_case'
    end
  end

  def gala_release_label
    stage = ENV['SST_STAGE'].presence
    release_version = ENV['GALA_RELEASE_VERSION'].presence || 'v2.9.9'

    return "#{stage} #{release_version}" if stage.in?(%w[dev production])

    preview_pr_number = ENV['GALA_PREVIEW_PR_NUMBER'].presence
    return "preview #{preview_pr_number}" if preview_pr_number

    ENV['RELEASE'].presence || release_version
  end

  def gala_release_url
    repository = ENV.fetch('GITHUB_REPOSITORY', 'galahq/gala')
    stage = ENV['SST_STAGE'].presence
    preview_pr_number = ENV['GALA_PREVIEW_PR_NUMBER'].presence
    release_url = ENV['RELEASE_URL'].presence || ENV['GALA_RELEASE_URL'].presence

    return release_url if release_url

    return "https://github.com/#{repository}/pull/#{preview_pr_number}" if preview_pr_number && !stage.in?(%w[dev production])
    return "https://github.com/#{repository}/tree/latest" if stage.in?(%w[dev production])

    release_ref = ENV['RELEASE'].presence || ENV['GALA_RELEASE_VERSION'].presence || 'latest'
    "https://github.com/#{repository}/tree/#{release_ref}"
  end
end
