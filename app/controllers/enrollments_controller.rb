class EnrollmentsController < ApplicationController
  layout "admin"
  helper CasesHelper

  before_action :authenticate_reader!
  authorize_actions_for Enrollment
  authority_actions :upsert => 'update'

  # GET /enrollments
  def index
    @cases = Case.all.includes(:enrollments).sort_by(&:kicker)
    @readers = Reader.all.order(:name)
  end

  def upsert
    c = Case.find_by_slug params[:case_slug]
    readers = params[:reader_id].split ','

    enrollments = readers.map do |reader_id|
      enrollment = Enrollment.find_or_initialize_by(case_id: c.id, reader_id: reader_id)
      enrollment.status = Enrollment.statuses[params[:status]]
      enrollment
    end

    begin
      Enrollment.transaction do
        enrollments.each(&:save!)
      end
      render json: c.readers_by_enrollment_status
    rescue ActiveRecord::RecordInvalid => invalid
      render status: :unprocessable_entity
    end
  end

  # DELETE /enrollments/1
  def destroy
    @enrollments = Enrollment.find(params[:id])
    @enrollments.each(&:destroy)
  end

  private
    # Only allow a trusted parameter "white list" through.
    def enrollment_params
      params.require(:enrollment).permit(:reader_id, :case_id)
    end
end
