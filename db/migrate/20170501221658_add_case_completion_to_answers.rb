# frozen_string_literal: true

class AddCaseCompletionToAnswers < ActiveRecord::Migration[5.0]
  def change
    add_column :answers, :case_completion, :numeric
  end
end
