# frozen_string_literal: true

class AddStatusToEnrollment < ActiveRecord::Migration[5.0]
  def change
    add_column :enrollments, :status, :integer, default: 0
  end
end
