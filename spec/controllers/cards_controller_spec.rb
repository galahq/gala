# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CardsController, type: :controller do
  describe 'PUT #update' do
    before do
      reader = create :reader, :editor
      sign_in reader
    end

    let(:card) { create :card }

    it 'allows :position or :solid to be set' do
      put :update, format: :json,
                   params: { id: card, card: { position: 2, solid: true } }
      card.reload
      expect(card.position).to be 2
      expect(card.solid).to be true
    end

    it 'allows :raw_content to be set with an empty RawDraftContentState' do
      empty = {
        'entity_map': {},
        'blocks': [
          {
            'key': 'fnsmj',
            'text': '',
            'type': 'unstyled',
            'depth': 0,
            'inline_style_ranges': [],
            'entity_ranges': [],
            'data': {}
          }
        ]
      }

      put :update, format: :json,
                   params: { id: card, card: { raw_content: empty } }
      card.reload
      expect(card.raw_content.paragraphs).to eq ['']
    end

    it 'allows :raw_content to be set with a complex RawDraftContentState' do
      complex = {
        'entity_map': {
          '0': {
            'type': 'EDGENOTE',
            'mutability': 'MUTABLE',
            'data': { 'slug': 'measure-tolerance-carrying-capacity' }
          }
        },
        'blocks': [
          {
            'key': 'al8ts',
            'text': 'Defining successful wolf management depends on the goals of managing the population and the context for establishing those goals. The DNR notes that the biological carrying capacity and social carrying capacity of wolves should be considered. Biological carrying capacity refers to the concept that the population of a species is limited by the ability of the environment to support it with food, water, and habitat. Social carrying capacity refers to how human tolerance for a species might limit its population. Successful management of wolves,then, means balancing the biological viability of the species and its important role in the ecosystem with the tolerance of the humans who live in its presence. As wildlife biologist David Hammill put it in testifying before the NRC, the viability of the wolf population in the state depends on the ability of humans and wolves to coexist peacefully. As a result, where species are in particular conflict with humans, conflict management is critical to sound scientific decision-making. Management goals are developed to balance ecosystem benefits and human conflicts.',
            'type': 'unstyled',
            'depth': 0,
            'inline_style_ranges': [
              { 'offset': 153, 'length': 29, 'style': 'BOLD' },
              { 'offset': 186, 'length': 24, 'style': 'BOLD' }
            ],
            'entity_ranges': [
              { 'offset': 186, 'length': 24, 'key': 0 }
            ],
            'data': {}
          }
        ]
      }

      put :update, format: :json,
                   params: { id: card, card: { raw_content: complex } }
      card.reload
      expect(card.raw_content.blocks.first.data['inlineStyleRanges'].count)
        .to eq 2
      expect(card.raw_content.entity_map.data['0'].type).to eq 'EDGENOTE'
    end

    it 'does not allow :raw_content to have comment threads baked in' do
      baked_in = {
        'entity_map': {
          '0': {
            'type': 'EDGENOTE',
            'mutability': 'MUTABLE',
            'data': { 'slug': 'archive-news-gelman' }
          }, '1': {
            'type': 'EDGENOTE',
            'mutability': 'MUTABLE',
            'data': { 'slug': 'archive-photo-lagoon' }
          }, '2': {
            'type': 'CITATION',
            'mutability': 'IMMUTABLE',
            'data': {
              'contents': '1,4 Dioxane and Pall Life Sciences/Gelman Sciences site. (n.d.). Retrieved July 23, 2017.',
              'href': 'http://www.a2gov.org/departments/systems-planning/planning-areas/climate-sustainability/pls/Pages/pls.aspx'
            }
          }
        }, 'blocks': [
          {
            'key': 'f90f7',
            'text': 'The company Gelman Sciences sat adjacent to the forest that’s home to the lake. They produced filters to detect water and air pollution, and used the solvent 1,4-dioxane in one step of the production process. To dispose of the chemical, Gelman sprayed it over its lawns and pumped it into unlined lagoons.° While swimming, Bicknell noticed a creek originating from the spray irrigation system, running down from the Gelman Sciences property into Third Sister Lake. The lake contamination was confirmed after that swim when Bicknell took a water sample to the university, revealing moderate levels of 1,4-dioxane.',
            'type': 'unstyled',
            'depth': 0,
            'inline_style_ranges': [
              { 'offset': 244, 'length': 25, 'style': 'THREAD' },
              { 'offset': 244, 'length': 25, 'style': 'thread--21' }
            ],
            'entity_ranges': [
              { 'offset': 85, 'length': 122, 'key': 0 },
              { 'offset': 274, 'length': 30, 'key': 1 },
              { 'offset': 305, 'length': 1, 'key': 2 }
            ],
            'data': {}
          }
        ]
      }

      put :update, format: :json,
                   params: { id: card, card: { raw_content: baked_in } }
      card.reload
      expect(card.raw_content.paragraphs.first.split(' ').first)
        .to eq 'The'
      expect(card.raw_content.blocks.first.data['inlineStyleRanges'].count)
        .to eq 0
    end
  end
end
