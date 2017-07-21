# frozen_string_literal: true

# Handle the linking of a user to a case deployment: create the reader’s case
# enrollment and group membership
class LinkerService
  attr_reader :strategy
  delegate :reader, :kase, :group, :status, to: :strategy

  def initialize(strategy)
    @strategy = strategy
  end

  def call
    create_group_membership
    create_case_enrollment
  end

  private

  def create_group_membership
    return unless reader
    return if reader.group_memberships.exists? group: group
    reader.group_memberships.create group: group
  end

  def create_case_enrollment
    return unless kase && reader
    Enrollment.upsert reader_id: reader.id,
                      case_id: kase.id,
                      active_group_id: group.id,
                      status: status
  end
end

# Strategies
# ==========

class LinkerService
  # Pull the deployment information from the LTI Launch Request, which includes
  # user authentication, context (= group), and the case as a GET param.
  class LTIStrategy
    def initialize(launch_params)
      @launch_params = launch_params
    end

    def reader
      @reader ||= authentication_strategy.try(:reader)
    end

    def kase
      @case ||= Case.find_by_slug @launch_params[:case_slug]
    end

    def group
      @group ||= Group.upsert context_id: @launch_params[:context_id],
                              name: @launch_params[:context_title]
    rescue
      # If two readers from the same class hit the launch url at the same time
      # it will violate a uniqueness constraint, but retrying the second will
      # return the group created by the first.
      retry
    end

    def status
      if @launch_params[:ext_roles] =~ %r{urn:lti:role:ims/lis/Instructor}
        :instructor
      else
        :student
      end
    end

    private

    def authentication_strategy
      @authentication_strategy ||= AuthenticationStrategy
                                   .find_by provider: 'lti',
                                            uid: @launch_params[:user_id]
    end
  end
end
