# frozen_string_literal: true

# @see ReadingList
class ReadingListsController < ApplicationController
  UUID_PATTERN = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i.freeze

  before_action :authenticate_reader!, only: %i[new create edit update destroy]
  before_action :set_reading_list, only: %i[show edit update destroy]

  layout 'admin'

  decorates_assigned :reading_list, context: ->(controller) do
    { host: controller.request.host_with_port }
  end

  # @route [GET] `/reading_lists/:uuid`
  def show; end

  # @route [GET] `/reading_lists/new`
  def new
    @reading_list = ReadingList.new
  end

  # @route [POST] `/reading_lists`
  def create
    @reading_list = current_reader.reading_lists.build reading_list_params

    if @reading_list.save
      redirect_to @reading_list
    else
      render :new
    end
  end

  # @route [GET] `/reading_lists/:uuid/edit`
  def edit
    authorize @reading_list
  end

  # @route [PUT/PATCH] `/reading_lists/:uuid`
  def update
    authorize @reading_list

    if update_reading_list
      redirect_to @reading_list
    else
      render :edit
    end
  end

  # @route [DELETE] `/reading_lists/:uuid`
  def destroy
    authorize @reading_list
    @reading_list.destroy
    redirect_to root_path
  end

  private

  def set_reading_list
    return head :not_found unless params[:uuid].match?(UUID_PATTERN)

    @reading_list =
      ReadingList
      .includes(reading_list_items: [case: [cover_image_attachment: :blob]])
      .find_by(uuid: params[:uuid])

    head :not_found unless @reading_list
  end

  def update_reading_list
    return unless ReadingListItem.acts_as_list_no_update do
      @reading_list.update reading_list_params
    end

    @reading_list.update_social_image
    true
  end

  def reading_list_params
    params.require(:reading_list).permit(
      :title, :description,
      reading_list_items_attributes: %i[id position notes case_slug _destroy]
    )
  end
end
