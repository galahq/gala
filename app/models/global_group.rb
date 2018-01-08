# frozen_string_literal: true

# Null object for {Group} that is used when a {Reader} who is not a member of a
# specific Group accesses a {Case}
#
# @see Group
class GlobalGroup
  def id
    nil
  end

  def deployment_for_case(_)
    GenericDeployment.new
  end

  def active?
    false
  end
end
