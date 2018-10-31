# frozen_string_literal: true

require 'matrix'

class AddUniqueIndexOnCaseAndGroupToDeployments < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        delete_duplicate_deployments
      end
    end

    add_index :deployments, %i[group_id case_id], unique: true
  end

  private

  def delete_duplicate_deployments
    say 'deleting duplicate deployments'
    deployments_to_delete.each(&:destroy)
  end

  def deployments_to_delete
    non_unique_deployments
      .order(created_at: :asc)
      .group_by { |d| [d.case_id, d.group_id] }
      .values
      .flat_map { |ds| ds[1..-1] }
  end

  def non_unique_deployments
    case_ids, group_ids = Matrix[*duplicate_pairs].transpose.to_a
    Deployment.where(case_id: case_ids, group_id: group_ids)
  end

  def duplicate_pairs
    Deployment.group(:case_id, :group_id).having('count(*) > 1')
              .pluck(:case_id, :group_id)
  end
end
