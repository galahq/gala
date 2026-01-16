# frozen_string_literal: true

# RuntimeStatsSnapshot wraps the latest runtime metrics.
class RuntimeStatsSnapshot
  include ActiveModel::Model

  attr_reader :data

  delegate :captured_at,
           :environment,
           :process,
           :gc,
           :heap,
           :objects,
           :caches,
           :redis,
           :postgres,
           :sidekiq,
           :action_cable,
           :warnings,
           to: :data

  def initialize(data = {})
    super()
    indifferent_data = data.with_indifferent_access
    @data = ActiveSupport::InheritableOptions.new(indifferent_data)
  end

  def model_name
    ActiveModel::Name.new(self.class, nil, 'RuntimeStats')
  end

  def to_param
    'current'
  end

  # Allow ActiveModelSerializers to fetch attributes dynamically.
  def read_attribute_for_serialization(attr)
    public_send(attr) if respond_to?(attr)
  end
end
