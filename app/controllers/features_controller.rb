# frozen_string_literal: true

class FeaturesController < ApplicationController
  def index
    enrolled = current_user.enrollments.pluck(:case_id)
    features = Case.where.not(id: enrolled)
                   .order(<<~SQL)
                     featured_at DESC NULLS LAST, published_at DESC NULLS LAST
                    SQL
                   .limit(6)
                   .pluck(:slug)
    render json: { features: features }
  end
end
