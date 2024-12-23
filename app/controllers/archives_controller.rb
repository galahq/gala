# frozen_string_literal: true

# Render PDF archives of cases
class ArchivesController < ApplicationController
  before_action :authenticate_reader!
  layout 'admin'

  # @route [GET] `/cases/case-slug/archive`
  def show
    set_case
    authorize @case

    refresh_archive if @case.archive_needs_refresh?

    redirect_to_download if @case.archive_fresh?
  end

  private

  def set_case
    @case = Case.friendly.find(params[:case_slug]).decorate
  end

  def refresh_archive
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
