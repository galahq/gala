# frozen_string_literal: true

# Given a case component post-create, update, or destroy, broadcast that change
# to the EditsChannel for the component’s case
class BroadcastEdit
  attr_reader :resource, :type

  def self.to(resource, type:)
    new(resource, type).call
  end

  def initialize(resource, type)
    @resource = resource
    @type = type
  end

  def call
    EditBroadcastJob.perform_later resource, case_slug: resource.case.slug,
                                             cached_params: cached_params,
                                             type: type
  end

  private

  def cached_params
    { type: resource.model_name.name,
      table: resource.model_name.plural,
      param: resource.to_param }
  end
end
