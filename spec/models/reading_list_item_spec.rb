# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadingListItem, type: :model do
  it { should belong_to :case }
  it { should belong_to :reading_list }
end
