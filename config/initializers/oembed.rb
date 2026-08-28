# frozen_string_literal: true

require 'oembed'

OEmbed::Providers.register_all

am_charts = OEmbed::Provider.new('https://live.amcharts.com/oembed')
am_charts << 'http://live.amcharts.com/*'
am_charts << 'https://live.amcharts.com/*'
OEmbed::Providers.register am_charts

# Knight Lab serves every story type from one endpoint; the old per-tool paths
# (/storymap/, /juxtapose/, /timeline/) now 301 to the root with a relative
# Location header, which ruby-oembed can't follow. The URL schemes below are
# the ones documented at https://oembed.knightlab.com.
knight_lab = OEmbed::Provider.new('https://oembed.knightlab.com/')
knight_lab << %r{^https?://cdn\.knightlab\.com/libs/timeline3/.+$}       # TimelineJS
knight_lab << %r{^https?://uploads\.knightlab\.com/storymapjs/.+$}       # StoryMapJS
knight_lab << %r{^https?://cdn\.knightlab\.com/libs/juxtapose/.+$}       # JuxtaposeJS
knight_lab << %r{^https?://uploads\.knightlab\.com/scenevr/.+$}          # SceneVR
knight_lab << %r{^https?://cdn\.knightlab\.com/libs/storyline/.+$}       # StoryLineJS
knight_lab << %r{^https?://theydrawit\.mucollective\.co/vis/.+$}         # They Draw It
OEmbed::Providers.register knight_lab

social_ex = OEmbed::Provider.new 'https://www.socialexplorer.com/services/oembed/'
social_ex << 'https://www.socialexplorer.com/*/explore'
social_ex << 'https://www.socialexplorer.com/*/view'
social_ex << 'https://www.socialexplorer.com/*/edit'
social_ex << 'https://www.socialexplorer.com/*/embed'
OEmbed::Providers.register social_ex

sketchfab = OEmbed::Provider.new 'http://sketchfab.com/oembed'
sketchfab << 'http://sketchfab.com/models/*'
sketchfab << 'https://sketchfab.com/3d-models/*'
sketchfab << 'https://sketchfab.com/models/*'
sketchfab << 'https://sketchfab.com/*/folders/*'
OEmbed::Providers.register sketchfab

datastudio = OEmbed::Provider.new 'http://datastudio.google.com/oembed'
datastudio << 'https://datastudio.google.com/*'
OEmbed::Providers.register datastudio

observable = OEmbed::Provider.new 'https://api.observablehq.com/oembed'
observable << 'https://observablehq.com/embed/*'
OEmbed::Providers.register observable

crowdsignal = OEmbed::Provider.new 'https://api.crowdsignal.com/oembed'
crowdsignal << 'https://*.survey.fm/*'
OEmbed::Providers.register crowdsignal

matterport = OEmbed::Provider.new 'https://my.matterport.com/api/v1/models/oembed/'
matterport << 'https://*.matterport.com/show/*'
OEmbed::Providers.register matterport

naive_oembed_url = Rails.application.credentials.dig :naive_oembed_url
unless naive_oembed_url.blank?
  naive = OEmbed::Provider.new naive_oembed_url
  naive << 'https://*.maps.arcgis.com/home/webmap/*'
  naive << 'https://*.maps.arcgis.com/apps/webappviewer/*'
  naive << 'https://*.maps.arcgis.com/apps/View/*'
  naive << 'https://plot.ly/~*/*.embed'
  naive << 'https://*.shinyapps.io/*'
  OEmbed::Providers.register naive
end
