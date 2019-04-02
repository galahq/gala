# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadingList, type: :model do
  it { should belong_to :reader }
  it { should have_many :cases }
  it { should have_many(:reading_list_items).dependent(:destroy) }

  it { should validate_presence_of :title }
end
