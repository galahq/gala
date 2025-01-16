# frozen_string_literal: true

module SpotlightsHelper
  def spotlight(key, placement = nil, &block)
    data = {
      'controller' => 'spotlight',
      'spotlight-key' => key,
      'spotlight-content' => I18n.t("spotlights.#{key}"),
      'spotlight-placement' => placement
    }

    if block_is_haml? block
      haml_tag :span, data: data do
        capture_haml(&block)
      end
    else
      content_tag :span, data: data do
        capture(&block)
      end
    end
  end
end
