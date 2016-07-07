Dir["./db/seeds/*.rb"].each {|file| require file }

%i( editor )
  .each do |role|
  Role.create! name: role
end

I18n.locale = :en

cameron = Reader.create(name: "Cameron Bothner", initials: 'clb', email: "cbothner@umich.edu", password: "password")
pearl = Reader.create name: "Pearl Zeng", initials: "曾茱", email: "zhuzeng@umich.edu", password: "password"

cameron.add_role :editor
pearl.add_role :editor

cameron.groups.create(name: "Team Koala")
