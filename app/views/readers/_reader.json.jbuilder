json.key_format! camelize: :lower
json.extract! reader, *%i(id name email initials image_url)
