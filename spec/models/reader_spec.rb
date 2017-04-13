require 'rails_helper'

RSpec.describe Reader, type: :model do

  subject { build :reader }

  it "records that a user chose a password when they set it directly" do
    subject.created_password = false
    subject.save

    subject.password = "new password"
    subject.save
    expect(subject.created_password).to be true
  end

end
