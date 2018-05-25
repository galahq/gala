# frozen_string_literal: true

require 'oembed'

OEmbed::Providers.register_all

am_charts = OEmbed::Provider.new('https://live.amcharts.com/oembed')
am_charts << 'http://live.amcharts.com/*'
am_charts << 'https://live.amcharts.com/*'
OEmbed::Providers.register am_charts

storymap = OEmbed::Provider.new('https://oembed.knightlab.com/storymap/')
storymap << 'https://uploads.knightlab.com/storymapjs*'
OEmbed::Providers.register storymap

juxtapose = OEmbed::Provider.new('https://oembed.knightlab.com/juxtapose/')
juxtapose << 'https://cdn.knightlab.com/libs/juxtapose*'
OEmbed::Providers.register juxtapose

timeline = OEmbed::Provider.new('https://oembed.knightlab.com/timeline/')
timeline << 'https://cdn.knightlab.com/libs/timeline*'
OEmbed::Providers.register timeline
