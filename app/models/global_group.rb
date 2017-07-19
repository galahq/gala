# frozen_string_literal: true

class GlobalGroup
  def deployment_for_case(_)
    GenericDeployment.new
  end

  def active?
    false
  end
end
