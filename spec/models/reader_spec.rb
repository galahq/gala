require 'rails_helper'

RSpec.describe Reader, type: :model do

  subject { build_stubbed :reader }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without an email" do
    subject.email = nil
    expect(subject).to_not be_valid
  end

end
