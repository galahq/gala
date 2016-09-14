module ReadersHelper
  def reader_icon(r)
    haml_tag :div, id: "reader-icon", style: ("background-image: url(#{r.image_url})" unless r.image_url.blank?) do
      haml_tag :span, (r.initials if r.image_url.blank?)
    end
  end
end
