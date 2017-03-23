class PagesController < ApplicationController
  before_action :authenticate_reader!, only: %i(create update destroy)
  before_action :set_case, only: [:create]
  before_action :set_page, only: [:update, :destroy]

  authorize_actions_for Page

  def create
    @page = Page.create_as_element @case, title: "New page"

    if @page.persisted?
      render @page
    else
      render json: @page.errors, status: :unprocessable_entity
    end
  end

  def update
    if @page.update(page_params)
      render @page
    else
      render json: @page.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @page.destroy
  end

  private
  def set_case
    @case = Case.find_by_slug params[:case_slug]
  end

  def set_page
    @page = Page.find params[:id]
  end

  def page_params
    params.require(:page).permit(:title, :position)
  end
end
