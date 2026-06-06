module Development
  class LiveReloadsController < ActionController::API
    def create
      return head :not_found unless Rails.env.development?

      ActionCable.server.broadcast(
        DevelopmentLiveReloadChannel.stream_name,
        {
          type: "reload",
          source: params[:source].presence || "unknown",
          path: params[:path],
          changed_at: Time.current.iso8601(6)
        }
      )

      head :accepted
    end
  end
end
