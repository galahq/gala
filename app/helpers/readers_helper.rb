# frozen_string_literal: true

# @see Reader
module ReadersHelper
  def reader_icon(r)
    style = ("background-image: url(#{r.image_url})" unless r.image_url.blank?)

    haml_tag :div, id: 'reader-icon', style: style do
      haml_tag :span, (r.initials if r.image_url.blank?)
    end
  end

  def toggle_role_button(reader, role)
    if reader.roles.include? role
      button_to 'Remove role', reader_role_path(reader, role),
                remote: true,
                method: :delete,
                class: %w[bp3-button bp3-intent-primary],
                data: { role_id: role.id }
    else
      button_to "Make #{role.name}", reader_roles_path(reader),
                remote: true,
                params: { role: { id: role.id } },
                class: 'bp3-button',
                data: { role_id: role.id }
    end
  end
end
