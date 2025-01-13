# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseCloner, type: :cloner do
  subject { described_class }
  let(:kase) { create :case, locale: :en }

  it 'nullifies published_at' do
    kase.published_at = Time.zone.now
    clone = described_class.partial_apply(:nullify, kase)
    expect(clone.to_record.published_at).to be_nil
  end

  it 'sets the new locale' do
    clone = described_class.partial_apply(:finalize, kase, locale: :fr)
    expect(clone.to_record.locale).to eq 'fr'
  end

  it 'adds a placeholder for the translator name' do
    clone = described_class.partial_apply(:finalize, kase, locale: :fr)
    expect(clone.to_record.translators).to eq ['—']
  end

  it 'sets case title for translation case' do
    kase.title = "My Rspec Test Case"
    clone = described_class.partial_apply(:finalize, kase, locale: :fr)
    expect(clone.to_record.title).to eq "Français: #{kase.title}"
  end

  it 'sets case title for non-translation case' do
    kase.title = "My Rspec Test Case"
    clone = described_class.partial_apply(:finalize, kase, locale: :en)
    expect(clone.to_record.title).to eq "COPY: #{kase.title}"
  end

  it 'copies all the case_elements' do
    kase = create :case_with_edgenotes, locale: :en

    clone = described_class.call kase, locale: :fr
    clone = clone.to_record

    expect(clone.case_elements).not_to eq kase.case_elements
    expect(table_of_contents(clone)).to eq table_of_contents kase

    expect(clone.edgenotes.map(&:slug)).not_to eq kase.edgenotes.map(&:slug)

    # Create a hash of website_urls to compare instead of relying on order
    source_urls = kase.edgenotes.map(&:website_url).sort
    cloned_urls = clone.edgenotes.map(&:website_url).sort
    expect(cloned_urls).to eq source_urls

    expect(first_card(clone).paragraphs).to eq first_card(kase).paragraphs
    expect(first_card(clone).case).to eq clone

    # Ensure Edgenote objects are cloned and attached properly
    expect(clone.edgenotes.count).to eq kase.edgenotes.count

    # Compare edgenotes by matching their website_urls
    kase.edgenotes.each do |source_edgenote|
      matching_clone = clone.edgenotes.find { |e| e.website_url == source_edgenote.website_url }
      expect(matching_clone).to be_present
    end
  end

  it "clears translaton base id when not translating" do
    kase = create :case_with_edgenotes, locale: :en
    clone = described_class.call kase, locale: :en
    expect(clone.to_record.translation_base_id).to eq(clone.to_record.id)
  end

  it "sets translation base id when translating" do
    kase = create :case_with_edgenotes, locale: :en
    clone = described_class.call kase, locale: :fr
    expect(clone.to_record.translation_base_id).to eq(kase.id)
  end

  private

  def table_of_contents(kase)
    kase.case_elements.preload(:element).map(&:element).map(&:title)
  end

  def first_card(kase)
    kase.pages.first.cards.first
  end
end
