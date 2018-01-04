# frozen_string_literal: true

class FeaturesController < ApplicationController
  # GET /cases/features
  def index
    enrolled = current_user.enrollments.pluck(:case_id)
    features = Case.where.not(id: enrolled)
                   .ordered
                   .limit(6)
                   .pluck(:slug)
    render json: { features: features }
  end
end
