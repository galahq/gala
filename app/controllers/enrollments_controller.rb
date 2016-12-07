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
          @enrollment = Enrollment.find_or_initialize_by case_id: kase.id, reader_id: reader_id
          @enrollment.status = params[:status]
          authorize_action_for @enrollment
          @enrollment.save!
        end
      end
      render partial: 'cases/case', locals: {c: kase}
    rescue ActiveRecord::RecordInvalid => invalid
      render status: :unprocessable_entity
    end

  end

  # DELETE /enrollments/1
  def destroy
    @enrollment = Enrollment.find(params[:id])
    authorize_action_for @enrollment
    @enrollment.destroy
  end

end
