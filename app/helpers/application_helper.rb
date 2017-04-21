module ApplicationHelper
  def parent_layout(layout)
    @view_flow.set(:layout, output_buffer)
    self.output_buffer = render(file: "layouts/#{layout}")
  end

  # Helpers for content_for blocks in view layouts
  %i(headline background_image_url email_footer).each do |key|
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

  def one_liner text
    # Removes newlines
    text.gsub(/\n/, '')
  end

  def markdown md
    redcarpet = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
    redcarpet.render md
  end

end
