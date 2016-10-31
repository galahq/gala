json.key_format! camelize: :lower
json.(reader, *%i(id name email initials image_url))
json.roles do
  Role.all.each do |role|
    json.set! role.name, reader.roles.include?(role)
  end
end
