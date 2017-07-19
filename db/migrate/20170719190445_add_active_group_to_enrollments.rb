# frozen_string_literal: true

class AddActiveGroupToEnrollments < ActiveRecord::Migration[5.0]
  def change
    add_column :enrollments, :active_group_id, :integer
  end
end
