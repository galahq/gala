# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reader do
  subject { create :reader }

  it 'can be manager of many libraries' do
    subject.libraries.create attributes_for(:library)
    subject.libraries.create attributes_for(:library)
    expect(subject.libraries.length).to eq 2
  end
end

RSpec.describe Library do
  subject { create :library }
  it 'can have many managers' do
    subject.managers.create attributes_for(:reader)
    subject.managers.create attributes_for(:reader)
    expect(subject.managers.length).to eq 2
  end
end
