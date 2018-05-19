# frozen_string_literal: true

# Given a case component post-create, update, or destroy, broadcast that change
# to the EditsChannel for the component’s case
class BroadcastEdit
  attr_reader :resource

  def self.to(resource)
    new(resource).call
  end

  def initialize(resource)
    @resource = resource
  end

  def call
    EditBroadcastJob.perform_later resource, case_slug: resource.case.slug,
                                             cached_params: cached_params
  end

  private

  def cached_params
    { type: resource.model_name.name,
      table: resource.model_name.plural,
      param: resource.to_param }
  end
end
