# frozen_string_literal: true

# Provides an after_action filter to broadcast the edits to a particular
# resource to the EditsChannel for that resource’s case
module BroadcastEdits
  extend ActiveSupport::Concern

  class_methods do
    def broadcast_edits(to:, type: nil)
      after_action -> { broadcast_edit_to to, type: type || action_name },
                   if: :successful?, only: %i[create update destroy]
    end
  end

  private

  def broadcast_edit_to(resource_name, type:)
    resource = if resource_name.to_s.start_with? '@'
                 instance_variable_get resource_name
               else
                 send resource_name
               end

    BroadcastEdit.to resource, type: type.to_s,
                               session_id: request.headers['X-Session-ID']
  end
end
