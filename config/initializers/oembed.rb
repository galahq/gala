# frozen_string_literal: true

require 'oembed'

OEmbed::Providers.register_all

am_charts = OEmbed::Provider.new('https://live.amcharts.com/oembed')
am_charts << 'http://live.amcharts.com/*'
am_charts << 'https://live.amcharts.com/*'
OEmbed::Providers.register am_charts
