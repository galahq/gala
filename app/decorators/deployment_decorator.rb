# frozen_string_literal: true

# @see Decorator
class DeploymentDecorator < ApplicationDecorator
  def magic_link
    h.magic_link_url key: key
  end

  def quiz_link
    h.link_to quiz_link_text, h.edit_deployment_path(object),
              class: %w[pt-button pt-small pt-minimal] << quiz_link_icon
  end

  private

  def quiz_link_text
    h.t(
      "deployments.deployment.#{posttest_assigned? ? 'edit_quiz' : 'add_quiz'}"
    )
  end

  def quiz_link_icon
    posttest_assigned? ? 'pt-icon-edit' : 'pt-icon-add' 
  end
end
