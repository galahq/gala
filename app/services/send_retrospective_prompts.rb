# frozen_string_literal: true

# After a professor has deployed a case in their classroom, we want to invite
# them to write up a retrospective of their experience as a post in the
# instructors-only community “CaseLog.” This service sends such notifications.
#
# Running once a week, on Wednesdays at noon (Eastern), we look for deployments
# whose members were much more active in the case 14 to 7 days ago than they
# were in the last 7 days. This is defined as an 80% drop-off of use from week
# to week, where the previous week measured over 500 events. This was chosen
# empirically based on recorded data at an early stage and should be subject to
# review. We exclude any deployments with fewer than five readers as a sanity
# check. When we send prompts to the instructors, we set the
# `retrospective_prompt_sent` flag so never to bug people more than once.
class SendRetrospectivePrompts
  def self.call(time_basis: Time.zone.now)
    new(time_basis).call
  end

  def initialize(now)
    @now = now
  end

  def call
    deployments_needing_prompts.map { |x| [x.group.name, x.case.slug] }
    # deployments_needing_prompts.each do |deployment|
    #   deployment.update retrospective_prompt_set: true
    #   DeploymentMailer.retrospective_prompt(deployment).deliver
    # end
  end

  private

  def deployments_needing_prompts
    candidate_deployments_with_enough_readers
      .select { |d| much_more_use_two_weeks_ago d }
  end

  def candidate_deployments_with_enough_readers
    count_readers_by_group = GroupMembership.group(:group_id).count(:reader_id)
    Deployment.where(retrospective_prompt_sent_at: nil)
              .select { |d| count_readers_by_group[d.group_id] > 5 }
  end

  def much_more_use_two_weeks_ago(deployment)
    two_weeks_ago = count_interesting_events(
      deployment,
      (@now - 2.weeks)..(@now - 1.week)
    )
    last_week = count_interesting_events(
      deployment,
      (@now - 1.week)..@now
    )

    two_weeks_ago > 500 && (two_weeks_ago - last_week) / two_weeks_ago > -0.8
  end

  def count_interesting_events(deployment, range)
    Ahoy::Event.interesting
               .where(user_id: deployment.group.readers.pluck(:id))
               .where_properties(case_slug: deployment.case.slug)
               .where(time: range)
               .count
  end
end
