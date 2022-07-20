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

social_ex = OEmbed::Provider.new 'https://www.socialexplorer.com/services/oembed/'
social_ex << 'https://www.socialexplorer.com/*/explore'
social_ex << 'https://www.socialexplorer.com/*/view'
social_ex << 'https://www.socialexplorer.com/*/edit'
social_ex << 'https://www.socialexplorer.com/*/embed'
OEmbed::Providers.register social_ex

sketchfab = OEmbed::Provider.new 'http://sketchfab.com/oembed'
sketchfab << 'http://sketchfab.com/models/*'
sketchfab << 'https://sketchfab.com/models/*'
sketchfab << 'https://sketchfab.com/*/folders/*'
OEmbed::Providers.register sketchfab

datastudio = OEmbed::Provider.new 'http://datastudio.google.com/oembed'
datastudio << 'https://datastudio.google.com/*'
OEmbed::Providers.register datastudio

observable = OEmbed::Provider.new 'https://api.observablehq.com/oembed'
observable << 'https://observablehq.com/embed/*'
OEmbed::Providers.register observable

naive_oembed_url = Rails.application.credentials.dig :naive_oembed_url
unless naive_oembed_url.blank?
  naive = OEmbed::Provider.new naive_oembed_url
  naive << 'https://cdn.knightlab.com/libs/storyline/*'
  naive << 'https://*.maps.arcgis.com/home/webmap/*'
  naive << 'https://*.maps.arcgis.com/apps/webappviewer/*'
  naive << 'https://*.maps.arcgis.com/apps/View/*'
  naive << 'https://plot.ly/~*/*.embed'
  naive << 'https://*.shinyapps.io/*'
  OEmbed::Providers.register naive
end
