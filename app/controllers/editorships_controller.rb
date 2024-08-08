# frozen_string_literal: true

# @see Editorship
class EditorshipsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_case, only: %i[new create]
  before_action :set_editorship, only: %i[destroy]

  layout 'admin'

  def index
    @editorships = current_reader.editorships.includes(:case)
    editorships_data = @editorships.map { |editorship| { editorship: editorship, case_slug: editorship.case.slug } }
    render json: editorships_data
  end


  # @param [GET] /cases/slug/editorships/new
  def new
    authorize @case, :update?
    @editorship = Editorship.new
  end

  # @param [POST] /cases/slug/editorships
  def create
    authorize @case, :update?

    @editorship = @case.editorships.build editorship_params

    if @editorship.save
      redirect_to edit_case_settings_path(@case), notice: successfully_created
    else
      render :new, status: :unprocessable_entity
    end
  end

  # @param [DELETE] /editorships/id
  def destroy
    authorize @editorship.case, :update?
    @editorship.destroy
    redirect_to edit_case_settings_path(@editorship.case),
                notice: successfully_destroyed
  end

  private

  def set_case
    @case = Case.friendly.find(params[:case_slug]).decorate
  end

  def set_editorship
    @editorship = Editorship.find params[:id]
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  def editorship_params
    params.require(:editorship).permit(:editor_email)
  end
end
