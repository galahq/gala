Dir["./db/seeds/*.rb"].each {|file| require file }

%i( editor )
  .each do |role|
  Role.create! name: role
end

I18n.locale = :en
cameron = Reader.create(name: "Cameron Bothner", initials: 'clb', email: "cbothner@umich.edu", password: "password")
cameron.add_role :editor
cameron.groups.create(name: "Team Koala")
