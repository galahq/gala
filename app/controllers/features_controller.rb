# frozen_string_literal: true

class FeaturesController < ApplicationController
  def index
    enrolled = current_user.enrollments.pluck(:case_id)
    features = Case.where.not(id: enrolled)
                   .order(:featured_at, :published_at)
                   .limit(6)
                   .pluck(:slug)
    render json: { features: features }
  end
end
