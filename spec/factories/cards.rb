# frozen_string_literal: true

def generate_blocks(paragraphs)
  paragraphs.each_with_index.map do |para, i|
    {
      key: "block#{i}",
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
      text: para
    }
  end
end

FactoryGirl.define do
  factory :card do
    raw_content do
      blocks = generate_blocks Faker::Hipster.paragraphs(rand(1..3))
      {
        entityMap: {},
        blocks: blocks
      }.to_json
    end
  end
end
