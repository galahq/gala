# frozen_string_literal: true

json.key_format! camelize: :lower
json.(reader, :id, :name, :image_url, :initials, :hash_key)
# Group rosters render this partial for other readers (grace-state rule W2).
json.email(reader.closed? ? nil : reader.email)
json.roles do
  reader_role_ids = reader.roles.map(&:id).to_set
  Role.all.each do |role|
    json.set! role.name, reader_role_ids.include?(role.id)
  end
end
json.active_community do
  json.partial! current_reader.active_community
end
json.any_editorships reader.editorships.any?
json.any_deployments reader.deployments.any?
