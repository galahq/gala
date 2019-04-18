# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadingListPolicy do
  let(:reader) { create :reader }

  let(:owned_list) do
    create(:reading_list).tap { |list| reader.reading_lists << list }
  end
  let(:other_list) { create :reading_list }

  subject { described_class }

  permissions :edit? do
    it 'does not allow a reader to edit someone else’s list' do
      expect(subject).not_to permit reader, other_list
    end

    it 'allows a reader to edit her own list' do
      expect(subject).to permit reader, owned_list
    end
  end

  permissions :update? do
    it 'does not allow a reader to edit someone else’s list' do
      expect(subject).not_to permit reader, other_list
    end

    it 'allows a reader to edit her own list' do
      expect(subject).to permit reader, owned_list
    end
  end

  permissions :destroy? do
    it 'does not allow a reader to delete someone else’s list' do
      expect(subject).not_to permit reader, other_list
    end

    it 'allows a reader to delete her own list' do
      expect(subject).to permit reader, owned_list
    end
  end
end
