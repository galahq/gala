# frozen_string_literal: true

module Cases
  # Provides stats dashboard for a Case, including per-country visit metrics.
  # Supports HTML, JSON, and CSV response formats.
  class StatsController < ApplicationController
    before_action :authenticate_reader!
    before_action :set_case

    # @param [GET] /cases/:case_slug/stats
    def show
      respond_to do |format|
        format.html do
          if stale? etag: stats_service.cache_key, last_modified: @case.updated_at.utc
            @cached_overview_html = cached_overview_html
            render :show, layout: 'admin'
          end
        end
        format.json { render json: stats_serializer.as_json }
        format.csv { prepare_csv_download }
      end
    end

    # @param [GET] /cases/:case_slug/stats/overview
    # Returns just the overview partial HTML for AJAX refresh
    def overview
      # Invalidate cache to get fresh data
      Rails.cache.delete(overview_cache_key)

      render partial: 'overview', locals: { overview: partial_locals }
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      authorize @case, :stats?
    end

    def stats_service
      @stats_service ||= CaseStatsService.new(@case, from: params[:from], to: params[:to])
    end

    def stats_serializer
      Cases::StatsSerializer.new(stats_service)
    end

    def overview_cache_key
      "stats/overview/#{@case.id}/#{stats_service.cache_key}"
    end

    def cached_overview_html
      Rails.cache.fetch(overview_cache_key, expires_in: 24.hours) do
        render_to_string(partial: 'overview', locals: { overview: partial_locals })
      end
    end

    def partial_locals
      @partial_locals ||= {
        published_at: @case.published_at,
        locales: [@case.locale, *@case.translation_set.pluck(:locale)].compact.uniq.to_a.join(', ') || '',
        deployments: @case.deployments.count,
        total_visits: stats_service.total_visits,
        country_count: stats_service.country_count
      }
    end

    def prepare_csv_download
      @csv_rows = stats_service.stats_rows

      send_data render_to_string(template: 'cases/stats/show', formats: [:csv]),
                type: 'text/csv; charset=utf-8',
                filename: csv_filename,
                disposition: 'attachment'
    end

    def csv_filename
      I18n.t(
        'cases.stats.csv_filename',
        slug: @case.slug,
        date: Date.current.strftime('%Y-%m-%d')
      )
    end
  end
end
