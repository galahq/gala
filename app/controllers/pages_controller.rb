class PagesController < ApplicationController
  before_action :authenticate_reader!, only: %i(create update destroy)
  before_action :set_case, only: [:create]
  before_action :set_page, only: [:update, :destroy]

  authorize_actions_for Page

  def create
    @page = @case.pages.build(title: "New page")

    if @page.save
      render partial: 'cases/case', locals: {c: @page.case}
    else
      render json: @page.errors, status: :unprocessable_entity
    end
  end

  def update
    if @page.update(page_params)
      render partial: 'cases/case', locals: {c: @page.case}
    else
      render json: @page.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @case = @page.case
    @page.destroy
    render partial: 'cases/case', locals: {c: @case}
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
