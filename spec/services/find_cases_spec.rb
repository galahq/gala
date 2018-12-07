# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FindCases, type: :model do
  describe '::by' do
    it 'finds cases that belong to a certain library' do
      michigan_library = create :library, slug: 'michigan'
      michigan_case = create :case, :published, library: michigan_library
      stanford_library = create :library, slug: 'stanford'
      stanford_case = create :case, :published, library: stanford_library

      params = { libraries: %w[michigan] }
      cases = FindCases.by(params, locale: :en)

      expect(cases).to include michigan_case
      expect(cases).not_to include stanford_case
    end

    it 'finds cases that belong to a library in a set' do
      michigan_library = create :library, slug: 'michigan'
      michigan_case = create :case, :published, library: michigan_library
      stanford_library = create :library, slug: 'stanford'
      stanford_case = create :case, :published, library: stanford_library
      iowa_library = create :library, slug: 'iowa'
      iowa_case = create :case, :published, library: iowa_library

      params = { libraries: %w[michigan stanford] }
      cases = FindCases.by(params, locale: :en)

      expect(cases).to include michigan_case
      expect(cases).to include stanford_case
      expect(cases).not_to include iowa_case
    end

    it 'finds cases that belong to the shared library' do
      michigan_library = create :library, slug: 'michigan'
      michigan_case = create :case, :published, library: michigan_library
      shared_case = create :case, :published, library: nil

      params = { libraries: [SharedCasesLibrary.instance.slug] }
      cases = FindCases.by(params, locale: :en)

      expect(cases).to include shared_case
      expect(cases).not_to include michigan_case
    end

    it 'finds cases matching tags' do
      apples_case = create(:case, :published).tap { |c| c.tag 'apples' }
      bananas_case = create(:case, :published).tap { |c| c.tag 'bananas' }

      params = { tags: %w[apples] }
      cases = FindCases.by params, locale: :en

      expect(cases).to include apples_case
      expect(cases).not_to include bananas_case
    end

    it 'finds cases matching query' do
      relevant_case = create :case, :published, title: 'qwertyuiop'
      irrelevant_case = create :case, :published, title: 'boring'
      ActiveRecord::Base.connection.execute <<~SQL
        REFRESH MATERIALIZED VIEW cases_search_index;
      SQL

      params = { q: 'qwertyuiop' }
      cases = FindCases.by params, locale: :en

      expect(cases).to include relevant_case
      expect(cases).not_to include irrelevant_case
    end

    it 'sanitizes query of quotes and question marks' do
      params = { q: %("something" 'something' ???) }
      FindCases.by params, locale: :en

      # expect that not to throw an error
    end

    it 'finds cases in a particular locale' do
      library = create :library, slug: 'library'
      english_case = create :case, :published, locale: :en, library: library
      french_case = create :case, :published, locale: :fr, library: library,
                                              translation_base: english_case

      params = { libraries: %w[library] }
      cases = FindCases.by params, locale: :fr

      expect(cases).to include french_case
      expect(cases).not_to include english_case
    end

    it 'falls back to English if a matching case isn’t translated' do
      library = create :library, slug: 'library'
      english_case = create :case, :published, locale: :en, library: library

      params = { libraries: %w[library] }
      cases = FindCases.by params, locale: :fr

      expect(cases).to include english_case
    end
  end
end
