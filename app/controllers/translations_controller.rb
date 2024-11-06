# frozen_string_literal: true

# Create a translation of a case
class TranslationsController < ApplicationController
  before_action :set_case
  before_action -> { authorize @case, :update? }
  layout 'admin'

  # @route [GET] `/cases/slug/translations/new`
  def new
  end

  # @route [POST] `/cases/slug/translations`
  def create
    head :unprocessable_entity && return unless case_locale.present?
    CaseCloneJob.perform_now @case, locale: case_locale
    redirect_to case_translation_path @case, case_locale: case_locale
  end

  # @route [GET] `/cases/slug/translations/locale`
  def show
    translation = @case.translations.find_by locale: case_locale
    redirect_to case_path translation if translation.present?
  end

  private

  def set_case
    @case = Case.friendly.find(params[:case_slug]).decorate
  end

  def case_locale
    return params[:case_locale] if params.key? :case_locale
    params[:case][:locale]
  end
end
