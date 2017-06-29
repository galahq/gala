# frozen_string_literal: true

class AddAnswersNeededToDeployments < ActiveRecord::Migration[5.0]
  def change
    add_column :deployments, :answers_needed, :integer, default: 1
  end
end
