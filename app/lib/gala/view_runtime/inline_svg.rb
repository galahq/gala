# frozen_string_literal: true

require 'nokogiri'

module Gala
  module ViewRuntime
    module InlineSvg
      class FileNotFound < IOError; end

      module Helper
        def inline_svg_tag(filename, attributes = {})
          raw Gala::ViewRuntime::InlineSvg.render(filename, attributes)
        end

        def inline_svg(filename, attributes = {})
          inline_svg_tag(filename, attributes)
        end
      end

      module_function

      def render(filename, attributes = {})
        svg = File.read(asset_path(filename))
        document = Nokogiri::HTML5.fragment(svg)
        node = document.at_css('svg')
        raise FileNotFound, "SVG root not found: #{filename}" unless node

        apply_attributes(node, attributes)
        node.to_html
      end

      def asset_path(filename)
        asset = Rails.application.assets&.load_path&.find(filename)
        return asset.path if asset

        Rails.application.config.assets.paths.each do |path|
          candidate = Pathname(path).join(filename)
          return candidate.to_s if candidate.file?
        end

        raise FileNotFound, "Asset not found: #{filename}"
      end

      def apply_attributes(node, attributes)
        attributes.each do |key, value|
          next if value.nil?

          node[attribute_name(key)] = attribute_value(value)
        end
      end

      def attribute_name(key)
        key.to_s.tr('_', '-')
      end

      def attribute_value(value)
        case value
        when Array
          value.compact.join(' ')
        when Hash
          value.map { |key, item| "#{attribute_name(key)}: #{item}" }.join('; ')
        else
          value.to_s
        end
      end
    end
  end
end
