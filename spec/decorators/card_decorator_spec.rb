# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CardDecorator do
  describe '#edgenotes' do
    it 'skips missing slugs and logs a warning' do
      edgenote = instance_double('Edgenote', slug: 'present', decorate: :decorated)
      case_record = instance_double('Case', id: 42, edgenotes: [edgenote])
      raw_content = instance_double('RawContent')
      allow(raw_content).to receive(:entities)
        .with(type: :EDGENOTE)
        .and_return([{ slug: 'present' }, { slug: 'missing' }])

      card = instance_double('Card',
                             id: 7,
                             case_id: 42,
                             case: case_record,
                             raw_content: raw_content)

      logger = instance_double(Logger)
      allow(Rails).to receive(:logger).and_return(logger)
      expect(logger).to receive(:warn)
        .with(/missing slugs=missing.*card_id=7 case_id=42/)

      decorated_edgenotes = described_class.new(card).edgenotes

      expect(decorated_edgenotes).to eq([:decorated])
    end
  end
end
