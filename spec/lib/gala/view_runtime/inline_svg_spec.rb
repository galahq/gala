# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Gala::ViewRuntime::InlineSvg do
  it 'renders an existing SVG asset inline with attributes' do
    html = ApplicationController.helpers.inline_svg_tag(
      'gala-logo.svg',
      class: %w[brand-logo header-logo]
    )

    expect(html).to be_html_safe
    expect(html).to include('<svg')
    expect(html).to include('class="brand-logo header-logo"')
  end
end
