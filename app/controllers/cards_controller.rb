class CardsController < ApplicationController
  before_action :authenticate_reader!, only: %i(create update destroy)
  before_action :set_page, only: [:create]
  before_action :set_card, only: [:update, :destroy]

  authorize_actions_for Card

  def create
    @card = @page.cards.build(card_params)
    @card.content ||= ""

    if @card.save
      render partial: 'cases/case', locals: {c: @card.case}
    else
      render json: @card.errors, status: :unprocessable_entity
    end
  end

  def update
    if @card.update(card_params)
      render partial: 'cases/case', locals: {c: @card.case}
    else
      render json: @card.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @case = @card.case
    @card.destroy
    render partial: 'cases/case', locals: {c: @case}
  end

  private
  def set_page
    @page = Page.find_by_id params[:page_id]
  end

  def set_card
    @card = Card.find_by_id params[:id]
  end

  def card_params
    params.require(:card).permit(:position, :content, :solid)
  end
end
