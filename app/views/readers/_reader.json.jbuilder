json.key_format! camelize: :lower
json.(reader, *%i(id name email initials image_url hash_key))
json.roles do
  Role.all.each do |role|
    json.set! role.name, reader.roles.include?(role)
  end
end
json.active_community do
  json.partial! current_reader.active_community
end
