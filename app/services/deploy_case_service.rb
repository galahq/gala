# frozen_string_literal: true

# Deploy a case, and all that entails
class DeployCaseService
  attr_reader :deployment, :reader

  delegate :group, to: :deployment

  def initialize(deployment_params, reader)
    @deployment = Deployment.new deployment_params
    @reader = reader
  end

  def call
    ActiveRecord::Base.transaction do
      save_deployment
      add_reader_as_group_administrator
      invite_reader_to_caselog
      enroll_reader_as_instructor
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotSaved
      nil
    end
    deployment
  end

  private

  def save_deployment
    deployment.build_group if deployment.group.blank?
    deployment.save!
  end

  def add_reader_as_group_administrator
    group.add_administrator reader
  end

  def enroll_reader_as_instructor
    Enrollment.upsert(**enrollment_params)
  end

  def enrollment_params
    { case_id: deployment.case_id, reader_id: reader.id,
      active_group_id: group.id, status: :instructor }
  end

  def invite_reader_to_caselog
    reader.invite_to_caselog
  end
end
