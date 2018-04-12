# frozen_string_literal: true

# @see Deployment
module DeploymentsHelper
  def options_for_case_select
    options_from_collection_for_select(
      Case.published,
      :id,
      :kicker,
      @deployment.case_id
    )
  end

  def options_for_group_select
    options_for_select([[t('deployments.helpers.create_a_new_study_group'), nil,
                         { data: { new: true } }]]) +
      grouped_options_for_select(
        [[I18n.t('deployments.helpers.all_study_groups'),
          options_from_collection_for_select(Group.all, :id, :name,
                                             @deployment.group_id)]]
      )
  end
end
