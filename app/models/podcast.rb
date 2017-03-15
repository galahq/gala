class Podcast < ApplicationRecord
  include Authority::Abilities

  belongs_to :case
  has_one :case_element, as: :element

  translates :title, :audio_url, :description, :credits

  def credits_list=(credits_list)
    self.credits = credits_list.is_a?(CreditsList) ? credits_list.attributes.to_yaml : credits_list.to_yaml
  end

  def credits_list
    self.credits ? CreditsList.new(YAML.load self.credits) : CreditsList.new
  end

  include Trackable
  def event_name
    'visit_podcast'
  end

  def event_properties
    {podcast_id: id}
  end
end
