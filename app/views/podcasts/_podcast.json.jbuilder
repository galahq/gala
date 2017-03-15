json.extract! podcast, *%i(id position title audio_url description artwork_url photo_credit)
json.credits podcast.credits_list.to_sentence
json.icon_slug "toc-podcast"
json.partial! 'trackable/statistics', locals: {trackable: podcast}
