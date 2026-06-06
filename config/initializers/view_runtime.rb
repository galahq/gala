# frozen_string_literal: true

require Rails.root.join('app/lib/gala/view_runtime/inline_svg')
require Rails.root.join('app/lib/gala/view_runtime/markerb')

ActionView::Base.include Gala::ViewRuntime::InlineSvg::Helper
ActionView::Template.register_template_handler(
  :markerb,
  Gala::ViewRuntime::Markerb::Handler.new
)
