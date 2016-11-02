json.extract! card, *%i(id position solid)
json.content card.content || ""
json.partial! 'trackable/statistics', locals: {trackable: card}
