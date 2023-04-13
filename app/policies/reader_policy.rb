# frozen_string_literal: true

# @see Reader
class ReaderPolicy < ApplicationPolicy
  def update?
    user == record || editor?
  end

  def edit_tos?
    update?
  end

  def update_tos?
    update?
  end
end
