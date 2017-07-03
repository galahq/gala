# frozen_string_literal: true

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
