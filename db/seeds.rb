Dir["./db/seeds/*.rb"].each {|file| require file }

I18n.locale = :en
cameron = Reader.create(name: "Cameron Bothner", initials: 'clb', email: "cbothner@umich.edu", password: "password")
cameron.groups.create(name: "Team Koala")
