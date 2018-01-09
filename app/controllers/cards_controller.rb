# frozen_string_literal: true

# @see Card
class CardsController < ApplicationController
  before_action :authenticate_reader!, only: %i[create update destroy]
  before_action :set_page, only: [:create]
  before_action :set_card, only: %i[update destroy]

  authorize_actions_for Card

  # @route [POST] `/pages/1/cards`
  def create
    @card = @page.cards.build(card_params)

    if @card.save
      render @card
    else
      render json: @card.errors, status: :unprocessable_entity
    end
  end

  # @route [PATCH/PUT] `/cards/1`
  def update
    if @card.update(card_params)
      render @card
    else
      render json: @card.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/cards/1`
  def destroy
    @card.destroy
    head :no_content
  end

  private

  def set_page
    @page = Page.find_by_id params[:page_id]
  end

  def set_card
    @card = Card.find_by_id params[:id]
  end

  def card_params
    Sv.hash_of(
      position: Sv.scalar,
      solid: Sv.scalar,
      raw_content: raw_draft_content_state
    ).(params.require(:card))
  end

  def raw_draft_content_state # rubocop:disable Metrics/AbcSize
    camelize(
      Sv.struct_of(
        blocks: Sv.array_of(
          Sv.hash_of(
            key: Sv.scalar,
            type: Sv.scalar,
            text: Sv.scalar,
            depth: Sv.scalar,
            data: Sv.anything,
            inlineStyleRanges: Sv.array_of(
              Sv.struct_of(
                style: Sv.one_of(%w[BOLD ITALIC]),
                offset: Sv.scalar,
                length: Sv.scalar
              )
            ),
            entityRanges: Sv.array_of(
              Sv.struct_of(
                key: Sv.scalar,
                offset: Sv.scalar,
                length: Sv.scalar
              )
            )
          )
        ),
        entityMap: Sv.map_of(
          Sv.struct_of(
            type: Sv.scalar,
            mutability: Sv.scalar,
            data: Sv.anything
          )
        )
      )
    )
  end

  # We have to send this over the wire stringified to prevent the keys from
  # being made snake_case
  def camelize(fn)
    ->(hash) {
      unless hash.is_a?(Hash) || hash.is_a?(ActionController::Parameters)
        return nil
      end

      fn.call(hash.permit!.to_h.deep_transform_keys! { |x| x.camelize(:lower) })
    }
  end
end
