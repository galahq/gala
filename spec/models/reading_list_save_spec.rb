# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadingListSave, type: :model do
  it { should belong_to :reader }
  it { should belong_to :reading_list }
end
