# frozen_string_literal: true

# @see Reader
class ReadersController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_reader,
                only: %i[show edit update destroy edit_tos update_tos]
  skip_before_action :confirm_tos, only: %i[edit update edit_tos update_tos]
  layout 'window'

  # @route [GET] `/readers`
  def index
    authorize Reader

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
    authorize @reader
  end

  # @route [PATCH/PUT] `/profile`
  def update
    authorize @reader

    respond_to do |format|
      if @reader.update(reader_params)
        bypass_sign_in @reader if reader_params.key? :password

        format.html do
          redirect_to edit_profile_path,
                      notice: successfully_updated(:account_settings)
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

  def edit_tos
    authorize @reader
  end

  def update_tos
    authorize @reader
    if tos_params['terms_of_service'].to_i == 1 # they checked the box
      @reader.update_attribute :terms_of_service,
                               Rails.application.config.current_terms_of_service
      session.delete('user_return_to')
      url = if @reader.sign_in_count == 1 && @reader.persona.blank?
              edit_profile_persona_path
            else
              session.delete('forwarding_url') || root_url
            end
      redirect_to url, notice: t('readers.edit_tos.accepted')
    else
      flash[:alert] = t('readers.edit_tos.must_accept')
      render :edit_tos, status: :unprocessable_entity
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_reader
    reader = if params[:id].blank?
               current_reader
             else
               Reader.find(params[:id])
             end
    @reader = reader.decorate
  end

  def search_params
    params.permit(:name, :role).to_h.symbolize_keys
  end

  def reader_params
    permitted = %i[name initials email locale send_reply_notifications
                   active_community_id image persona]

    permitted << :password if reader_can_set_password_this_request

    params.require(:reader).permit(*permitted)
  end

  def tos_params
    params.require(:reader).permit(:terms_of_service)
  end

  def reader_can_set_password_this_request
    @reader_can_set_password_this_request ||=
      @reader && !@reader.created_password
  end
end
