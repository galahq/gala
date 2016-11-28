json.key_format! camelize: :lower
json.(reader, *%i(id name email initials image_url))
json.roles do
  Role.all.each do |role|
    json.set! role.name, reader.roles.include?(role)
  end
end
json.cases reader.cases do |c|
  json.(c, *%i(slug kicker))
  json.square_cover_url ix_cover_image(c, :square)
end
