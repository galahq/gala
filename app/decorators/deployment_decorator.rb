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
                class: quiz_link_classes
    end
  end

  private

  def quiz_link_text
    h.t(
      "deployments.deployment.#{posttest_assigned? ? 'edit_quiz' : 'add_quiz'}"
    )
  end

  def quiz_link_classes
    # Match the sibling deployment buttons (1 enrolled / Invite Learners): a small,
    # minimal BP6 button with the add/edit glyph. These were legacy pt-/bp4- classes
    # (dead under BP6), which stripped the button styling, sizing, and the "+" icon.
    %w[bp6-button bp6-small bp6-minimal] + [blueprint_icon_class]
  end

  def blueprint_icon_class
    posttest_assigned? ? 'bp6-icon-edit' : 'bp6-icon-plus'
  end
end
