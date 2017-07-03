# frozen_string_literal: true

class GlobalGroup
  def deployment_for_case(_)
    GenericDeployment.new
  end
end
