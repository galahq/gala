# frozen_string_literal: true

# Render PDF archives of cases
class ArchivesController < ApplicationController
  before_action :authenticate_reader!
  layout 'admin'

  # @route [GET] `/cases/case-slug/archive`
  def show
    set_case
    authorize @case

    Rails.logger.info(
      "ArchivesController#show " \
      "case_slug=#{@case.slug} " \
      "needs_refresh=#{@case.archive_needs_refresh?} " \
      "archive_fresh=#{@case.archive_fresh?}"
    )

    refresh_archive if @case.archive_needs_refresh?

    if @case.archive_fresh?
      Rails.logger.info(
        "ArchivesController#show redirect_to_download " \
        "case_slug=#{@case.slug}"
      )
      redirect_to_download
    else
      Rails.logger.info(
        "ArchivesController#show archive_not_ready " \
        "case_slug=#{@case.slug}"
      )
    end
  end

  private

  def set_case
    @case = Case.friendly.find(params[:case_slug]).decorate
  end

  def refresh_archive
    Rails.logger.info(
      "ArchivesController#refresh_archive enqueue " \
      "case_slug=#{@case.slug}"
    )
    @case.refresh_archive! root_url: root_url
  end

  def root_url
    url = request.protocol + request.host_with_port + '/'
    # fixes archive generation running docker network locally
    url.gsub!('localhost', 'web') if ENV['DOCKER_DEV'].present?
    url
  end

  def redirect_to_download
    redirect_to rails_blob_path @case.archive_pdf, disposition: 'attachment'
  end
end
