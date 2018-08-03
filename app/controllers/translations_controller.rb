# frozen_string_literal: true

# Create a translation of a case
class TranslationsController < ApplicationController
  before_action :set_case
  before_action -> { authorize @case, :update? }

  layout 'admin'

  # @route [GET] `/cases/slug/translations/new`
  def new; end

  private

  def set_case
    @case = Case.friendly.find(params[:case_slug]).decorate
  end
end
