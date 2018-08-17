# frozen_string_literal: true

# @see CaseElement
class CaseElementsController < ApplicationController
  include BroadcastEdits

  before_action :authenticate_reader!

  broadcast_edits to: :@case_element

  # @route [PATCH/PUT] `/case_elements/1`
  def update
    @case_element = CaseElement.find(params[:id])
    authorize @case_element.case, :update?

    if @case_element.update(case_element_params)
      @case_elements = Case.includes(:case_elements)
                           .find_by(id: @case_element.case_id)
                           .case_elements
    else
      render json: @case_element.errors, status: :unprocessable_entity
    end
  end

  private

  def case_element_params
    params.require(:case_element).permit(:position)
  end
end
