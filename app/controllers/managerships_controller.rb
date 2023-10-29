# frozen_string_literal: true

# @see Managership
class ManagershipsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_library, only: %i[new create]
  before_action :set_managership, only: %i[destroy]

  layout 'admin'

  decorates_assigned :library

  def index
    @libraries = current_reader.libraries
    render json: @libraries.decorate
  end

  # @param [GET] /libraries/slug/managerships/new
  def new
    authorize @library, :update?
    @managership = @library.managerships.build
  end

  # @param [POST] /libraries/slug/managerships
  def create
    authorize @library, :update?

    @managership = @library.managerships.build managership_params

    if @managership.save
      redirect_to edit_library_path(@library), notice: successfully_created
    else
      render :new, status: :unprocessable_entity
    end
  end

  # @param [DELETE] /managerships/id
  def destroy
    authorize @managership.library, :update?
    @managership.destroy
    redirect_to edit_library_path(@managership.library),
                notice: successfully_destroyed
  end

  private

  def set_library
    @library = Library.friendly.find params[:library_slug]
  end

  def set_managership
    @managership = Managership.find params[:id]
  end

  def managership_params
    params.require(:managership).permit(:manager_email)
  end
end
