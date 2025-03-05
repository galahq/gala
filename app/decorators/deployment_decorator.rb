# frozen_string_literal: true

# @see Decorator
class DeploymentDecorator < ApplicationDecorator
  decorates_association :case

  def magic_link
    h.magic_link_url key: key
  end

  def quiz_link
    h.spotlight :add_quiz, placement: :top do
      h.link_to quiz_link_text, h.edit_deployment_path(object),
                data: { controller: 'anchor-focus' }, id: "d#{id}quiz",
                class: %w[bp3-button bp3-small bp3-minimal] << link_icon_class
    end
  end

  private

  def quiz_link_text
    h.t(
      "deployments.deployment.#{posttest_assigned? ? 'edit_quiz' : 'add_quiz'}"
    )
  end

  def link_icon_class
    posttest_assigned? ? 'bp3-icon-edit' : 'bp3-icon-plus'
  end
end
