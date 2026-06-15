# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseDecorator do
  describe '#cover_url' do
    it 'returns an ActiveStorage variant URL for an attached variable cover image' do
      kase = create :case
      kase.cover_image.attach(
        io: File.open(Rails.root.join('spec/fixtures/files/block-m.png')),
        filename: 'block-m.png',
        content_type: 'image/png'
      )

      cover_url = described_class.new(kase).cover_url

      expect(cover_url).to include('/rails/active_storage/representations/redirect/')
      expect(cover_url).not_to start_with('data:image')
    end
  end

  describe '#other_available_locales' do
    it 'includes translations of a case that the reader has access to' do
      reader = create :reader
      kase = create :case, published: true

      # Include published translations
      create :case, locale: :ja, translation_base: kase, published: true

      # Don’t include unpublished translations
      create :case, locale: :es, translation_base: kase, published: false

      # Include unpublished translations this reader can edit
      cas = create :case, locale: :fr, translation_base: kase, published: false
      reader.my_cases << cas

      subject = described_class.new(kase)
      locales = subject.other_available_locales(for_reader: reader)

      aggregate_failures do
        expect(locales).to have_key('ja')
        expect(locales).not_to have_key('es')
        expect(locales).to have_key('fr')
      end
    end
  end
end
