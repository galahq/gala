# frozen_string_literal: true

# An attachment to a case that provides an engaging activity that the learners
# can do to solidify their understanding.
#
# In implementation, an Activity is a Page with an icon and, to start with, an
# instructions Card and an Edgenote pointing to the activity materials
class ActivityCreator
  # Needed for ActiveModel::Serializer
  alias read_attribute_for_serialization send

  attr_reader :kase, :page, :card, :edgenote

  def self.for(kase)
    new(kase).call
  end

  def initialize(kase)
    @kase = kase
  end

  def call
    create_page
    create_card
    create_edgenote
    self
  end

  private

  def create_page
    @page = Page.new(default_page_params).tap do |page|
      page.build_case_element case: kase
      page.save
    end
  end

  def create_card
    @card = page.cards.create raw_content: default_content_state
  end

  def create_edgenote
    @edgenote = Edgenote.create default_edgenote_params.merge case: kase
    card.raw_content.add_edgenote edgenote, range: default_edgenote_range
    card.save
  end

  def default_page_params
    { icon_slug: 'activity-evaluate' }
  end

  def default_content_state
    ContentState.with_text(['Instructions', 'Use the attached file to...'])
                .tap do |c_s|
      c_s.blocks.first.type = 'header-two'
    end
  end

  def default_edgenote_params
    { caption: 'Edit this Edgenote to upload or link to your activity materials.' }
  end

  def default_edgenote_range
    ContentState::Range.new 1, 8, 13
  end
end
