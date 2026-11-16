# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Group do
  describe '#name' do
    # As created by an instructor using Gala in Spanish.
    let(:group) do
      create(:group).tap { |group| group.update_columns(name: { 'es' => 'Clase de prueba' }) }.reload
    end

    it 'shows the name it was given when there is none in the current language' do
      expect(I18n.with_locale(:en) { group.name }).to eq 'Clase de prueba'
    end

    it 'prefers a translation in the current language' do
      I18n.with_locale(:en) { group.update!(name: 'Test class') }

      expect(I18n.with_locale(:en) { group.name }).to eq 'Test class'
      expect(I18n.with_locale(:es) { group.name }).to eq 'Clase de prueba'
    end

    it 'returns only the translation asked for by locale' do
      expect(group.name(locale: :en)).to be_nil
    end
  end
end
