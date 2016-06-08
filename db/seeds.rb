Dir["./db/seeds/*.rb"].each {|file| require file }

I18n.locale = :en
cameron = Reader.create(id: 1, name: "Cameron Bothner", image_url: "https://lh3.googleusercontent.com/-_i-0kZDjsWI/AAA...", email: "cbothner@umich.edu", password: "$2a$11$iJwtewgka8OW9qPEvdUxHOYbe6g2EUFN8Fp2HfoMDTM...", provider: "google_oauth2", uid: "102343030121442585482", authentication_token: "sdsRFgm-ZznkejWt4D4K")
cameron.groups.create(name: "Team Koala")
