# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Case do
  subject { build_stubbed :case }

  it 'can have many editors' do
    subject.editors.build attributes_for(:reader)
    subject.editors.build attributes_for(:reader)
    expect(subject.editors.length).to eq 2
  end
end

RSpec.describe Reader do
  subject { build :reader }

  it 'can have many editable cases' do
    subject.my_cases.build attributes_for(:case)
    subject.my_cases.build attributes_for(:case)
    expect(subject.my_cases.length).to eq 2
  end
end
