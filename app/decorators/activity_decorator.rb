# frozen_string_literal: true

# @see Activity
class ActivityDecorator < ApplicationDecorator
  def pdf_url
    return nil unless pdf.attached?
    h.url_for pdf
  end
end
