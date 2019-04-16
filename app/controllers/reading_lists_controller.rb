# frozen_string_literal: true

# @see ReadingList
class ReadingListsController < ApplicationController
  layout 'admin'

  # @route [GET] `/reading_lists/:uuid`
  def show
    set_reading_list
  end

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
    set_reading_list
  end

  private

  def set_reading_list
    @reading_list =
      ReadingList
      .includes(reading_list_items: [case: [cover_image_attachment: :blob]])
      .find(params[:uuid])
  end

  def reading_list_params
    params.require(:reading_list).permit(:title, :description)
  end
end
