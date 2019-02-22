# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SpotlightAcknowledgement, type: :model do
  it { should belong_to :reader }
end
