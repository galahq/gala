module ReadersHelper
  def reader_icon(r)
    haml_tag :div, id: "reader-icon", style: ("background-image: url(#{r.image_url})" unless r.image_url.blank?) do
      haml_tag :span, (r.initials if r.image_url.blank?)
    end
  end

  def toggle_role_button reader, role
    if reader.roles.include? role
      button_to "Remove", reader_role_path(reader, role),
        remote: true,
        method: :delete,
        data: { role_id: role.id }
    else
      button_to "Make #{role.name}", reader_roles_path(reader),
        remote: true,
        params: { role: {id: role.id} },
        form_class: "button--subtle",
        data: { role_id: role.id }
    end
  end
end
