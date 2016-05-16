class Podcast < ApplicationRecord
  belongs_to :case

  translates :title, :audio_url, :description
end
