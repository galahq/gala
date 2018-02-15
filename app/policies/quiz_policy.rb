# frozen_string_literal: true

# @see Quiz
class QuizPolicy < ApplicationPolicy
  # Readers can only see the answers for quizzes after they have submitted their
  # post-quiz
  def show?
    return false unless deployment_for_current_user.present?
    !current_user_needs_posttest?
  end

  private

  def current_user_needs_posttest?
    submissions_of_current_user.count < number_of_answers_needed
  end

  def submissions_of_current_user
    record.submissions.where(reader: user)
  end

  def number_of_answers_needed
    deployment_for_current_user.answers_needed || 0
  end

  def deployment_for_current_user
    record.deployments.find_by(group: user.groups)
  end
end
