json.array! @cases do |c|
  json.key_format! camelize: :lower
  json.extract! c, *%i(slug published kicker title dek case_authors summary tags photo_credit)
  json.base_cover_url c.cover_url
  json.small_cover_url ix_cover_image(c, :small)
  json.cover_url ix_cover_image(c, :billboard)
  json.translators translators_string c
  if reader_signed_in?
    if current_reader.can_update? c
      json.enrollments do
        Enrollment.statuses.each do |status, num|
          json.set! status, c.enrollments.select(&:"#{status}?")
        end
      end
    end
  end
end
