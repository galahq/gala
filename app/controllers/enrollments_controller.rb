# frozen_string_literal: true

class EnrollmentsController < ApplicationController
  helper CasesHelper

  before_action :authenticate_reader!, except: %i[new create]
  authorize_actions_for Enrollment, except: %i[new create]
  authority_actions upsert: 'update'

  # GET /enrollments
  def index
    @cases = Case.all.sort_by(&:kicker)
    @readers = Reader.all.includes(:cases, enrollments: %i[case reader])
                     .order(:name)

    render layout: 'admin'
  end

  # Landing for “Magic Link”
  # GET /enrollments/new?key=ABCDEF
  def new
    @deployment = Deployment.includes(
      case: [:podcasts,
             :edgenotes,
             activities: %i[case_element card],
             pages: %i[case_element cards]]
    ).find_by_key params['key']

    render layout: 'window'
  end

  include MagicLink
  def create
    save_deployment_in_session
    link_reader
    redirect_to after_linking_redirect_path
  end

  def upsert
    kase = Case.find_by_slug params[:case_slug]
    reader_ids = params[:reader_id].split ','

    begin
      Enrollment.transaction do
        reader_ids.each do |reader_id|
          @enrollment = Enrollment.find_or_initialize_by case_id: kase.id,
                                                         reader_id: reader_id
          @enrollment.status = params[:status]
          authorize_action_for @enrollment
          EnrollmentMailer.introduce_case(@enrollment).deliver if params[:send_emails]
          @enrollment.save!
        end
      end
      render partial: 'cases/case', locals: { c: kase }
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
