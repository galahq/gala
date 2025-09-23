# frozen_string_literal: true

# @see Enrollment
class EnrollmentSerializer < ApplicationSerializer
  attributes :id, :status, :case_slug, :active_group_id, :group_name, :community_name

  def case_slug
    object.case.slug
  end

  def group_name
    object.active_group&.name
  end

  def community_name
    object.active_group&.community&.name
  end
end
