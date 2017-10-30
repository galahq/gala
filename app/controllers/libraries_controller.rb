# frozen_string_literal: true

class LibrariesController < ApplicationController
  before_action :set_library

  def show
    head(:not_found) && return unless @library
  end

  private

  def set_library
    @library = Library.find_by_slug params[:slug]
  end
end
