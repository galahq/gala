# frozen_string_literal: true

# @see CaseLibraryRequests
class CaseLibraryRequestsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_request, only: %i[update destroy]

  # @route [GET] `/case_library_requests`
  def index
    @requests = policy_scope(CaseLibraryRequest)
                .includes(:case, :library, :requester).pending
    render json: @requests
  end

  # @route [PUT/PATCH] `/case_library_requests/id`
  def update
    ActiveRecord::Base.transaction do
      @request.update! status: request_params[:status]
      @request.case.update! library: @request.library if @request.accepted?
    end
    redirect_to edit_library_path(@request.library),
                notice: successfully_updated
  end

  # @route [DELETE] `/case_library_requests/id`
  def destroy
    @request.destroy!
    redirect_to edit_case_settings_path(@request.case),
                notice: successfully_destroyed
  end

  private

  def set_request
    @request = CaseLibraryRequest.find(params[:id])
    authorize @request
  end

  def request_params
    params.require(:case_library_request).permit(:status)
  end
end
