# frozen_string_literal: true

# @see ReadingList
class ReadingListsController < ApplicationController
  layout 'admin'

  # @route [GET] `/reading_lists/:uuid`
  def show
    set_reading_list
  end

  private

  def set_reading_list
    @reading_list =
      ReadingList
      .includes(reading_list_items: [case: [cover_image_attachment: :blob]])
      .find(params[:uuid])
  end
end
