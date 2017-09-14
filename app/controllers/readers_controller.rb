# frozen_string_literal: true

class ReadersController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_reader, only: %i[show edit update destroy]
  layout 'window'

  authorize_actions_for Case, except: %i[edit update]

  # GET /readers
  # GET /readers.json
  def index
    @readers = Reader.all.order(:name).preload(:roles)
                     .includes(:cases, enrollments: [:case])

    render layout: 'admin'
  end

  def show; end

  # GET /readers/1/edit
  def edit
    authorize_action_for @reader
  end

  # PATCH/PUT /readers/1
  # PATCH/PUT /readers/1.json
  def update
    authorize_action_for @reader
    respond_to do |format|
      if @reader.update(reader_params)
        bypass_sign_in @reader if reader_params.key? :password
        format.html { redirect_to edit_profile_path, notice: 'Reader was successfully updated.' }
        format.json { render :show, status: :ok, location: @reader }
      else
        format.html { render :edit }
        format.json { render json: @reader.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /readers/1
  # DELETE /readers/1.json
  def destroy
    @reader.destroy
    respond_to do |format|
      format.html { redirect_to readers_url, notice: 'Reader was successfully destroyed.' }
      format.json { head :no_content }
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

  # Never trust parameters from the scary internet, only allow the white list through.
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
