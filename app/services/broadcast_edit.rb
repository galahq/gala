# frozen_string_literal: true

# Given a case component post-create, update, or destroy, broadcast that change
# to the EditsChannel for the component’s case
class BroadcastEdit
  attr_reader :resource

  def self.to(resource, type:, session_id:)
    new(resource).call type, session_id
  end

  def initialize(resource)
    @resource = resource
  end

  def call(type, session_id)
    EditBroadcastJob.perform_now resource, case_slug: resource.case.slug,
                                             cached_params: cached_params,
                                             type: type, session_id: session_id
  end

  private

  def cached_params
    { type: resource.model_name.name,
      table: resource.model_name.plural,
      param: resource.to_param }
  end
end
