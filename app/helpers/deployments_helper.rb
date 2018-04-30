# frozen_string_literal: true

# @see Deployment
module DeploymentsHelper
  def focus_deployment_path(deployment)
    deployments_path anchor: "d#{deployment.id}"
  end

  def focus_deployment_quiz_path(deployment)
    deployments_path anchor: "d#{deployment.id}quiz"
  end

  def reader_counts_by_deployment_id
    @reader_counts_by_deployment_id ||=
      Reader.unscoped
            .joins(groups: :deployments, enrollments: { case: :deployments })
            .group('deployments.id, deployments_cases.id')
            .having('deployments.id = deployments_cases.id')
            .distinct.count
            .tap { |hash| hash.default = 0 }
  end

  def options_for_group_select
    options = options_for_select(
      [[t('deployments.helpers.create_a_new_study_group'), nil,
        { data: { new: true } }]]
    )
    options += all_group_options unless groups.empty?
    options
  end

  def groups
    Group.administered_by(current_user).order(:name)
  end

  def show_header?
    controller.send(:selection_params).blank?
  end

  private

  def all_group_options
    grouped_options_for_select(
      [[I18n.t('deployments.helpers.all_study_groups'),
        options_from_collection_for_select(
          groups, :id, :name, @deployment.group_id
        )]]
    )
  end
end
