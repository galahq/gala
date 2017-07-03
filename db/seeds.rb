# frozen_string_literal: true

Dir['./db/seeds/*.rb'].each { |file| require file }

%i[editor]
  .each do |role|
  Role.create! name: role
end

I18n.locale = :en
