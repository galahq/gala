# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadingList, type: :model do
  it 'belongs to a reader' do
    expect(described_class.reflect_on_association(:reader).macro)
      .to eq(:belongs_to)
  end

  it 'has many cases' do
    expect(described_class.reflect_on_association(:cases).macro)
      .to eq(:has_many)
  end

  it 'destroys reading list items when destroyed' do
    association = described_class.reflect_on_association(:reading_list_items)

    expect(association.macro).to eq(:has_many)
    expect(association.options[:dependent]).to eq(:destroy)
  end

  it 'destroys reading list saves when destroyed' do
    association = described_class.reflect_on_association(:reading_list_saves)

    expect(association.macro).to eq(:has_many)
    expect(association.options[:dependent]).to eq(:destroy)
  end

  it 'requires a title' do
    list = build(:reading_list, title: nil)

    expect(list).not_to be_valid
    expect(list.errors[:title]).to be_present
  end

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
