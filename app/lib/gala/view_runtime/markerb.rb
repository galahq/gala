# frozen_string_literal: true

require 'action_view'
require 'action_view/template'

module Gala
  module ViewRuntime
    module Markerb
      mattr_accessor :processing_options, :renderer, default: {}

      class Markdown
        def self.to_html(compiled_source)
          renderer = Gala::ViewRuntime::Markerb.renderer || Redcarpet::Render::HTML
          Redcarpet::Markdown.new(
            renderer,
            Gala::ViewRuntime::Markerb.processing_options
          ).render(compiled_source)
        end
      end

      class Handler
        def erb_handler
          @erb_handler ||= ActionView::Template.registered_template_handler(:erb)
        end

        def call(template, source = nil)
          source ||= template.source
          compiled_source = erb_handler.call(template, source)
          return compiled_source unless template.format == :html

          "Gala::ViewRuntime::Markerb::Markdown.to_html(begin;#{compiled_source};end).html_safe"
        end
      end
    end
  end
end
