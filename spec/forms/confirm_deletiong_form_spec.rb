# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ConfirmDeletionForm, type: :model do
  let(:kase) { build_stubbed :case }

  it 'is valid if kicker is confirmed' do
    kase.kicker = 'Kicker'
    form = described_class.new case: kase, kicker_confirmation: 'Kicker'
    expect(form).to be_valid
  end

  it 'is invalid if kicker confirmation doesn’t match' do
    kase.kicker = 'Kicker'
    form = described_class.new case: kase, kicker_confirmation: 'Wrong'
    expect(form).not_to be_valid
  end

  it 'is valid if kicker is blank and confirmation matches' do
    kase.kicker = ''
    form = described_class.new case: kase, kicker_confirmation: ''
    expect(form).to be_valid
  end

  it 'is valid if kicker is nil and confirmation is blank' do
    kase.kicker = nil
    form = described_class.new case: kase, kicker_confirmation: ''
    expect(form).to be_valid
  end

  it 'deletes the case if saved while valid' do
    kase.kicker = 'Kicker'
    allow(kase).to receive :destroy

    form = described_class.new case: kase, kicker_confirmation: 'Kicker'
    form.save

    expect(kase).to have_received :destroy
  end

  it 'does not delete the case if saved while invalid' do
    kase.kicker = 'Kicker'
    allow(kase).to receive :destroy

    form = described_class.new case: kase, kicker_confirmation: 'Wrong'
    form.save

    expect(kase).not_to have_received :destroy
  end
end
