# frozen_string_literal: true

class CreateCaseLibraryRequest < ActiveRecord::Migration[6.0]
  def change
    create_table :case_library_requests do |t|
      t.belongs_to :case, foreign_key: true, index: true
      t.belongs_to :library, foreign_key: true, index: true
      t.belongs_to :requester, foreign_key: { to_table: :readers }
      t.string :status, default: CaseLibraryRequest.statuses[:pending]
      t.timestamps
    end
  end
end
