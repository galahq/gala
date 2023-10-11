# frozen_string_literal: true

# @see Library
class LibrariesController < ApplicationController
  before_action :authenticate_reader!, only: %i[create edit update destroy]
  before_action :set_libraries, only: %i[index create]
  before_action :set_library, only: %i[show edit update destroy]
  before_action :set_requests, only: %i[edit]

  layout 'admin'

  decorates_assigned :libraries, :library

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

  # @route [GET] `/libraries/slug/edit`
  def edit
    authorize @library
    @managerships = @library.managerships
    @pending_requests = @requests.where(library: @library).pending
  end

  # @route [PUT/PATCH] `/libraries/slug`
  def update
    authorize @library
    if @library.update library_params
      redirect_to libraries_url, notice: successfully_updated
    else
      render :edit
    end
  end

  # @route [DELETE] `/libraries/slug`
  def destroy
    authorize @library
    @library.destroy
    redirect_to libraries_url, notice: successfully_destroyed
  end

  private

  def set_libraries
    @libraries = policy_scope(Library).ordered
  end

  def set_library
    if params[:slug] == SharedCasesLibrary.instance.slug
      return @library = SharedCasesLibrary.instance
    end

    @library = Library.friendly.find params[:slug]
  end

  def set_requests
    @requests = policy_scope(CaseLibraryRequest)
  end

  def library_params
    allowlist = %i[slug name description url logo background_color
                   foreground_color]
    allowlist.concat %i[visible_in_catalog] if policy(Library).create?

    params.require(:library).permit allowlist
  end
end
