# frozen_string_literal: true

# Readers can save reading lists to their “libraries”
class SavedReadingListsController < ApplicationController
  before_action :authenticate_reader!

  def index
    render json: current_reader.saved_reading_lists
  end
end
