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
    kase = Case.find_by_slug params[:case_slug]
    reader_ids = params[:reader_id].split ','

    begin
      Enrollment.transaction do
        reader_ids.each do |reader_id|
          Enrollment.upsert case_id: kase.id, reader_id: reader_id, status: params[:status]
        end
      end
      render partial: 'cases/case', locals: {c: kase}
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
