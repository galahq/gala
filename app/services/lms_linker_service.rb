# frozen_string_literal: true

class LmsLinkerService
  def initialize(launch_params)
    @launch_params = launch_params
  end

  def authentication_strategy
    @authentication_strategy ||= AuthenticationStrategy
                                 .find_by provider: 'lti',
                                          uid: @launch_params[:user_id]
  end

  def reader
    @reader ||= authentication_strategy.try(:reader)
  end

  def status
    if @launch_params[:ext_roles] =~ %r{urn:lti:role:ims/lis/Instructor}
      :instructor
    else
      :student
    end
  end

  def group
    @group ||= Group.upsert context_id: @launch_params[:context_id],
                            name: @launch_params[:context_title]
  rescue
    # If two readers from the same class hit the launch url at the same time
    retry
  end

  def add_reader_to_group
    return unless reader
    return if reader.group_memberships.exists? group: group
    reader.group_memberships.create group: group
  end

  def enroll_reader_in_case(kase)
    return unless reader
    Enrollment.upsert reader_id: reader.id, case_id: kase.id, status: status
  end
end
