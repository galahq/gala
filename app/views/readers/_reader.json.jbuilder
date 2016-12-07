json.key_format! camelize: :lower
json.(reader, *%i(id name email initials image_url))
json.roles do
  Role.all.each do |role|
    json.set! role.name, reader.roles.include?(role)
  end
end
json.cases reader.enrollments do |e|
  json.(e.case, *%i(slug kicker published))
  json.square_cover_url ix_cover_image(e.case, :square)
  json.enrollment_id e.id
end
