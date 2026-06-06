# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reader, type: :model do
  subject { build :reader }

  it 'destroys reading lists when destroyed' do
    association = described_class.reflect_on_association(:reading_lists)

    expect(association.macro).to eq(:has_many)
    expect(association.options[:dependent]).to eq(:destroy)
  end

  it 'destroys reading list saves when destroyed' do
    association = described_class.reflect_on_association(:reading_list_saves)

    expect(association.macro).to eq(:has_many)
    expect(association.options[:dependent]).to eq(:destroy)
  end

  it 'has many saved reading lists through reading list saves' do
    association = described_class.reflect_on_association(:saved_reading_lists)

    expect(association.macro).to eq(:has_many)
    expect(association.options[:through]).to eq(:reading_list_saves)
  end

  it 'has many spotlight acknowledgements' do
    expect(described_class.reflect_on_association(:spotlight_acknowledgements).macro)
      .to eq(:has_many)
  end

  it 'defines the persona enum on a string column' do
    expect(described_class.defined_enums['persona']).to eq(
      'learner' => 'learner',
      'teacher' => 'teacher',
      'writer' => 'writer'
    )
    expect(described_class.type_for_attribute('persona').type).to eq(:string)
  end

  it 'gets access to CaseLog if its persona is teacher' do
    subject.persona = 'teacher'
    subject.save
    expect(subject.communities).to include Community.case_log
  end

  it 'gets access to CaseLog if its persona is writer' do
    subject.persona = 'writer'
    subject.save
    expect(subject.communities).to include Community.case_log
  end

  it 'records that a user chose a password when they set it directly' do
    subject.created_password = false
    subject.save

    subject.password = 'new password'
    subject.save
    expect(subject.created_password).to be true
  end

  it 'has access to the right communities' do
    subject.save

    invited_community = create :community
    create :invitation, reader: subject, community: invited_community

    group = create :group
    subject.groups << group

    expect(subject.communities).to include(invited_community,
                                           group.community)
  end

  describe '#acknowledged_spotlights' do
    it 'lists the spotlight keys that the reader has acknowledgements' do
      reader = create :reader
      create :spotlight_acknowledgement, reader: reader, spotlight_key: 'yep'

      expect(reader.acknowledged_spotlights).to eq(%w[yep])
    end
  end

  describe '#send_devise_notification' do
    let(:delivery) { instance_double(ActionMailer::MessageDelivery) }
    let(:smtp_error) do
      Net::SMTPAuthenticationError.new('535 Authentication Credentials Invalid')
    end

    around do |example|
      previous_raise_delivery_errors =
        ActionMailer::Base.raise_delivery_errors
      example.run
    ensure
      ActionMailer::Base.raise_delivery_errors =
        previous_raise_delivery_errors
    end

    before do
      allow(AuthenticationMailer).to receive(:confirmation_instructions)
        .and_return(delivery)
      allow(delivery).to receive(:deliver_now).and_raise(smtp_error)
    end

    it 'suppresses mail delivery failures when delivery errors are disabled' do
      ActionMailer::Base.raise_delivery_errors = false
      allow(Rails.logger).to receive(:warn)

      expect do
        subject.send_devise_notification(
          :confirmation_instructions,
          'confirmation-token',
          {}
        )
      end.not_to raise_error

      expect(Rails.logger).to have_received(:warn).with(
        /Devise notification delivery failed notification=confirmation_instructions/
      )
    end

    it 'raises mail delivery failures when delivery errors are enabled' do
      ActionMailer::Base.raise_delivery_errors = true

      expect do
        subject.send_devise_notification(
          :confirmation_instructions,
          'confirmation-token',
          {}
        )
      end.to raise_error(Net::SMTPAuthenticationError)
    end
  end
end
