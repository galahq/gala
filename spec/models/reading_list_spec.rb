# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadingList, type: :model do
  it { should belong_to :reader }
  it { should have_many :cases }
  it { should have_many(:reading_list_items).dependent(:destroy) }
  it { should have_many(:reading_list_saves).dependent(:destroy) }

  it { should validate_presence_of :title }

  describe '#saved_by?' do
    it 'returns false if the given reader has not saved this list' do
      reader = create :reader
      list = create :reading_list

      expect(list.saved_by?(reader)).to be_falsey
    end

    it 'returns true if the given reader has saved this list' do
      reader = create :reader
      list = create :reading_list
      reader.saved_reading_lists << list

      expect(list.saved_by?(reader)).to be_truthy
    end
  end
end
