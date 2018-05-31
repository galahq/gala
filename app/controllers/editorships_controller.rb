# frozen_string_literal: true

# @see Editorship
class EditorshipsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_editorship, only: %i[destroy]

  layout 'admin'

  # @param [GET] /cases/slug/editorships/new
  def new; end

  # @param [POST] /cases/slug/editorships
  def create; end

  # @param [DELETE] /editorships/id
  def destroy
    authorize @editorship.case, :update?
    @editorship.destroy
    redirect_to edit_case_settings_path(@editorship.case),
                notice: successfully_destroyed
  end

  private

  def set_editorship
    @editorship = Editorship.find params[:id]
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end
end
