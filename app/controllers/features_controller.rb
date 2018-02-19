# frozen_string_literal: true

# Featured cases appear prominently in the catalog.
class FeaturesController < ApplicationController
  # @route [GET] `/cases/features`
  def index
    enrolled = current_user.enrollments.pluck(:case_id)
    features = Case.where.not(id: enrolled)
                   .ordered
                   .limit(6)
                   .map(&:slug)
    render json: { features: features }
  end
end
