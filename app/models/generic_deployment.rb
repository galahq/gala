# frozen_string_literal: true

# Null object for {Deployment} that is used when a {Reader} who is not a member
# of a specific {Group} accesses a {Case}
#
# @see Deployment
class GenericDeployment
  def pretest_assigned?
    false
  end

  def reader_needs_pretest?(_)
    false
  end

  def posttest_assigned?
    false
  end

  def reader_needs_posttest?(_)
    false
  end

  def quiz
    nil
  end
end
