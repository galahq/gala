# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseCloner, type: :cloner do
  subject { described_class }
  let(:kase) { create :case, locale: :en }

  it 'nullifies published_at' do
    kase.published_at = Time.zone.now
    clone = described_class.partial_apply(:nullify, kase)
    expect(clone.published_at).to be_nil
  end

  it 'sets the new locale' do
    clone = described_class.partial_apply(:finalize, kase, locale: :fr)
    expect(clone.locale).to eq 'fr'
  end

  it 'adds a placeholder for the translator name' do
    clone = described_class.partial_apply(:finalize, kase, locale: :fr)
    expect(clone.translators).to eq ['—']
  end

  it 'sets case title for translation case' do
    kase.title = "My Rspec Test Case"
    clone = described_class.partial_apply(:finalize, kase, locale: :fr)
    expect(clone.title).to eq "Français: #{kase.title}"
  end

  it 'sets case title for non-translation case' do
    kase.title = "My Rspec Test Case"
    clone = described_class.partial_apply(:finalize, kase, locale: :en)
    expect(clone.title).to eq "COPY: #{kase.title}"
  end

  it 'copies all the case_elements' do
    kase = create :case_with_edgenotes, locale: :en

    clone = described_class.call kase, locale: :fr

    expect(clone.case_elements).not_to eq kase.case_elements
    expect(table_of_contents(clone)).to eq table_of_contents kase

    expect(clone.edgenotes.map(&:slug)).not_to eq kase.edgenotes.map(&:slug)
    expect(clone.edgenotes.map(&:website_url).to_set)
      .to eq kase.edgenotes.map(&:website_url).to_set

    expect(first_card(clone).paragraphs).to eq first_card(kase).paragraphs
    expect(first_card(clone).case).to eq clone
    expect(clone.translation_base_id).to eq(clone.id)
  end

  private

  def table_of_contents(kase)
    kase.case_elements.preload(:element).map(&:element).map(&:title)
  end

  def first_card(kase)
    kase.pages.first.cards.first
  end
end
