# frozen_string_literal: true

module SpotlightsHelper
  def spotlight(key, placement = nil, &block)
    data = {
      'gala-controller' => 'spotlight',
      'spotlight-key' => key,
      'spotlight-content' => I18n.t("spotlights.#{key}"),
      'spotlight-placement' => placement
    }

    content_tag :span, data: data do
      capture(&block)
    end
  end
end
