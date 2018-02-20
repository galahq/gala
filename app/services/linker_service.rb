# frozen_string_literal: true

# Handle the linking of a user to a case deployment: create the reader’s
# case enrollment and group membership
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
      ensure_deployment_exists
    end

    def reader
      @reader ||= authentication_strategy.try(:reader)
    end

    def kase
      @case ||= Case.friendly.find @launch_params[:case_slug]
    rescue ActiveRecord::RecordNotFound
      nil
    end

    def group
      @group ||= Group.upsert context_id: @launch_params[:context_id],
                              name: @launch_params[:context_title]
    rescue ActiveRecord::RecordNotUnique
      # If two readers from the same class hit the launch url at the same time
      # it will violate a uniqueness constraint, but retrying the second will
      # return the group created by the first.
      retry
    end

    def status
      instructor_role = %r{urn:lti:role:ims/lis/Instructor}
      return unless @launch_params[:ext_roles] =~ instructor_role

      :instructor
    end

    private

    def authentication_strategy
      @authentication_strategy ||= AuthenticationStrategy
                                   .find_by provider: 'lti',
                                            uid: @launch_params[:user_id]
    end

    def ensure_deployment_exists
      return unless group.deployments.exists? case: kase
      group.deployments.create case: kase
    end
  end

  # Get the deployment information from an id stored in the session. This
  # strategy assumes the deployment has been created in advance and that a user
  # is already signed in.
  class SessionStrategy
    attr_accessor :reader
    def initialize(session, reader)
      @reader = reader
      @deployment = Deployment.find_by_key session.delete MagicLink::SESSION_KEY
    end

    def kase
      @deployment.case
    end

    def group
      @deployment.group
    end

    def status
      nil
    end
  end
end
