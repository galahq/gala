# frozen_string_literal: true

# @see Page
class PagesController < ApplicationController
  include BroadcastEdits

  before_action :authenticate_reader!, only: %i[create update destroy]
  before_action :set_case, only: [:create]
  before_action :set_page, only: %i[update destroy]

  broadcast_edits to: :@page

  # @route [POST] `/cases/case-slug/pages`
  def create
    authorize @case, :update?

    @page = Page.new page_params
    @page.build_case_element case: @case

    if @page.save
      render @page
    else
      render json: @page.errors, status: :unprocessable_entity
    end
  end

  # @route [PATCH/PUT] `/pages/1`
  def update
    authorize @page.case, :update?

    if @page.update(page_params)
      render @page
    else
      render json: @page.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/pages/1`
  def destroy
    authorize @page.case, :update?

    @page.destroy
  end

  private

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end

  def set_page
    @page = Page.find params[:id]
  end

  def page_params
    params[:page].permit(:title, :position)
  end
end
