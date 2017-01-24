json.extract! card, *%i(id position solid raw_content)
json.content card.content || ""
json.partial! 'trackable/statistics', locals: {trackable: card}
