require 'rails_helper'

RSpec.describe Case, type: :model do

  subject { build_stubbed :case }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without a slug" do
    subject.slug = nil
    expect(subject).to_not be_valid
  end

  it "is not valid with an invalid slug" do
    subject.slug = "asdf asdf"
    expect(subject).to_not be_valid

    subject.slug = "asdf_asdf"
    expect(subject).to_not be_valid

    subject.slug = "asdf/asdf"
    expect(subject).to_not be_valid

    subject.slug = "ASDF-ASDF"
    expect(subject).to_not be_valid
  end

end
