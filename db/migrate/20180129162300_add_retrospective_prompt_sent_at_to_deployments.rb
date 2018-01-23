class AddRetrospectivePromptSentAtToDeployments < ActiveRecord::Migration[5.1]
  def change
    add_column :deployments, :retrospective_prompt_sent_at, :timestamp
  end
end
