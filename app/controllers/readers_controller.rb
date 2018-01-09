# frozen_string_literal: true

# @see Reader
class ReadersController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_reader, only: %i[show edit update destroy]
  layout 'window'

  authorize_actions_for Case, only: %i[index destroy]

  # @route [GET] `/readers`
  def index
    @readers = FindReaders.by(**search_params)
                          .page(params[:page])
                          .preload(:roles)

    @roles = Role.where(name: %w[editor invisible])

    render layout: 'admin'
  end

  # @route [GET] `/profile`
  def show; end

  # @route [GET] `/profile/edit`
  def edit
    authorize_action_for @reader
  end

  # @route [PATCH/PUT] `/profile`
  def update
    authorize_action_for @reader
    respond_to do |format|
      if @reader.update(reader_params)
        bypass_sign_in @reader if reader_params.key? :password
        format.html do
          redirect_to edit_profile_path,
                      notice: 'Reader was successfully updated.'
        end
        format.json { render :show, status: :ok, location: profile_path }
      else
        format.html { render :edit }
        format.json do
          render json: @reader.errors, status: :unprocessable_entity
        end
      end
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_reader
    @reader = if params[:id].blank?
                current_reader
              else
                Reader.find(params[:id])
              end
  end

  def search_params
    params.permit(:name, :role).to_h.symbolize_keys
  end

  def reader_params
    unless defined? @reader_can_set_password
      @reader_can_set_password = @reader && !@reader.created_password
    end

    permitted = %i[name initials email locale send_reply_notifications
                   active_community_id]
    permitted << :password if @reader_can_set_password

    params.require(:reader).permit(*permitted)
  end
end
