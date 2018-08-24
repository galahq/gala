# frozen_string_literal: true

# @see Library
class LibrariesController < ApplicationController
  before_action :authenticate_reader!, only: %i[index]
  before_action :set_libraries, only: %i[index create]
  before_action :set_library, only: %i[show]

  layout 'admin'

  decorates_assigned :libraries

  # @route [GET] `/libraries`
  def index
    @library = Library.new
  end

  # @route [GET] `/libraries/slug.json`
  def show
    return head(:not_found) unless @library
  end

  # @route [POST] `/libraries`
  def create
    @library = Library.new library_params

    authorize @library

    if @library.save
      redirect_to libraries_url, notice: successfully_created
    else
      render :index
    end
  end

  private

  def set_libraries
    @libraries = policy_scope Library.ordered
  end

  def set_library
    @library = Library.find_by_slug params[:slug]
    if params[:slug] == SharedCasesLibrary.instance.slug
      @library ||= SharedCasesLibrary.instance
    end
  end

  def library_params
    params.require(:library)
          .permit(:slug, :name, :description, :url, :background_color,
                  :foreground_color)
  end
end
