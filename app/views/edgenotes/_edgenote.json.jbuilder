json.key_format! camelize: :lower
json.extract! edgenote, :slug, :caption, :format, :thumbnail_url, :content, :website_url, :embed_code, :instructions, :image_url, :pdf_url, :photo_credit

json.partial! 'trackable/statistics', locals: {trackable: edgenote}
