json.extract! podcast, *%i(position title audio_url description artwork_url photo_credit)
json.credits podcast.credits_list.to_sentence
