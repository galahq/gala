# frozen_string_literal: true

# @see Card
class CardDecorator < ApplicationDecorator
  # Find the edgenote objects from the case’s association to take advantage of
  # preloading
  def edgenotes
    missing_slugs = []
    edgenotes = find_edgenotes(missing_slugs)
    log_missing_slugs(missing_slugs) if missing_slugs.any?
    edgenotes.map(&:decorate)
  end

  private

  def find_edgenotes(missing_slugs)
    edgenote_slugs.filter_map do |slug|
      edgenote =
        object.case.edgenotes.find do |candidate|
          candidate.slug == slug
        end

      missing_slugs << slug unless edgenote
      edgenote
    end
  end

  def log_missing_slugs(slugs)
    Rails.logger.warn(
      "CardDecorator#edgenotes missing slugs=#{slugs.join(',')} " \
      "card_id=#{object.id} case_id=#{object.case_id}"
    )
  end

  def edgenote_slugs
    raw_content.entities(type: :EDGENOTE).map { |e| e[:slug] }
  end

  def citations
    raw_content.entities(type: :CITATION)
  end
end
