# frozen_string_literal: true

json.key_format! camelize: :lower
json.(reader, :id, :name, :image_url, :email, :initials, :hash_key)
json.roles do
  Role.all.each do |role|
    json.set! role.name, reader.roles.include?(role)
  end
end

json.any_editorships reader.editorships.any?
json.any_deployments reader.deployments.any?
