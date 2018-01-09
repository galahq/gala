# frozen_string_literal: true

# @see Reader
class ReaderAuthorizer < ApplicationAuthorizer
  # Readers can’t edit other peoples’ profiles
  def updatable_by?(reader)
    resource == reader || super
  end
end
