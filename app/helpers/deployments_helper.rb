# frozen_string_literal: true

# @see Deployment
module DeploymentsHelper
  def reader_counts_by_deployment_id
    @_reader_counts_by_deployment_id ||=
      Reader.unscoped
            .joins(groups: :deployments, enrollments: { case: :deployments })
            .group('deployments.id, deployments_cases.id')
            .having('deployments.id = deployments_cases.id')
            .distinct.count
            .tap { |hash| hash.default = 0 }
  end

  def options_for_case_select
    options_from_collection_for_select(
      Case.published,
      :id,
      :kicker,
      @deployment.case_id
    )
  end

  def options_for_group_select
    options = options_for_select(
      [[t('deployments.helpers.create_a_new_study_group'), nil,
        { data: { new: true } }]]
    )

    unless groups.empty?
      options += grouped_options_for_select(
        [[I18n.t('deployments.helpers.all_study_groups'),
          options_from_collection_for_select(
            groups, :id, :name, @deployment.group_id
          )]]
      )
    end

    options
  end

  def groups
    Group.administered_by(current_user)
  end
end