# frozen_string_literal: true

# @see ReadingListSave
class ReadingListSavesController < ApplicationController
  before_action :authenticate_reader!

  # @route [POST] `/reading_lists/:uuid/save`
  def create
    current_reader.saved_reading_lists << reading_list
    head :no_content
  end

  private

  def reading_list
    ReadingList.find(params[:reading_list_uuid])
  end
end
