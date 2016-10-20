require 'rails_helper'

RSpec.describe Case, type: :model do

  subject { build_stubbed :case }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

end
