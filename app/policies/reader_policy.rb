# frozen_string_literal: true

# @see Reader
class ReaderPolicy < ApplicationPolicy
  def update?
    user == record || editor?
  end
end
