# frozen_string_literal: true

module Cases
  # Serializes CaseStatsService data into a predictable JSON structure.
  #
  # @example
  #   service = CaseStatsService.new(kase, from: '2024-01-01', to: '2024-12-31')
  #   serializer = Cases::StatsSerializer.new(service)
  #   render json: serializer.as_json
  #
  # Output structure:
  #   {
  #     data: [
  #       {
  #         country: { iso2: "US", iso3: "USA", name: "United States" },
  #         metrics: { unique_visits: 100, unique_users: 50, ... },
  #         first_event: "2024-01-01T00:00:00Z",
  #         last_event: "2024-02-01T00:00:00Z"
  #       }
  #     ],
  #     meta: {
  #       from: "2024-01-01",
  #       to: "2024-02-01",
  #       total_visits: 500,
  #       country_count: 25,
  #       total_podcast_listens: 42
  #     }
  #   }
  class StatsSerializer
    attr_reader :service

    # @param service [CaseStatsService] The stats service instance
    def initialize(service)
      @service = service
    end

    # @return [Hash] Serialized stats data
    def as_json(_options = nil)
      {
        data: service.api_data,
        meta: meta
      }
    end

    # Alias for compatibility with render json:
    alias to_json as_json

    private

    def meta
      {
        from: service.from_date.iso8601,
        to: service.to_date.iso8601,
        total_visits: service.total_visits,
        country_count: service.country_count,
        total_podcast_listens: service.total_podcast_listens
      }
    end
  end
end
