# frozen_string_literal: true

class AddMissingIndexes < ActiveRecord::Migration[6.0]
  def change
    add_index :case_elements, %i[element_id element_type]
    add_index :editorships, %i[case_id editor_id]
    add_index :enrollments, %i[case_id reader_id]
    add_index :invitations, %i[community_id reader_id]
    add_index :readers_roles, :role_id
  end
end
