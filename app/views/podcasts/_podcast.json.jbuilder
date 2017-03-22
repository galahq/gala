json.extract! podcast, *%i(id position title audio_url artwork_url photo_credit)
json.credits podcast.credits_list.to_sentence
json.card_id podcast.card.id
json.icon_slug "toc-podcast"
json.partial! 'trackable/statistics', locals: {trackable: podcast}
