# frozen_string_literal: true

class Case
  # A PDF archive of a case and all its pages, podcasts, and edgenotes
  class Pdf
    SOURCE_VIEW_PATH = 'cases/pdf'

    EAGER_LOADING_CONFIG = [
      :cards,
      { edgenotes: [
        audio_attachment: :blob,
        file_attachment: :blob,
        image_attachment: :blob
      ] },
      { case_elements: :element }
    ].freeze

    attr_reader :case_study, :root_url

    def initialize(case_study, root_url:)
      @case_study = preload_associations(case_study).decorate
      root_url = ensure_trailing_slash(root_url.to_s)
      @root_url = URI(root_url)
    end

    def file
      @file ||= generate_pdf
    end

    private

    def ensure_trailing_slash(url)
      url.end_with?('/') ? url : "#{url}/"
    end

    def preload_associations(case_study)
      Case.includes(EAGER_LOADING_CONFIG).find(case_study.id)
    end

    def generate_pdf
      kit = PDFKit.new(html, options)
      kit.to_pdf
    rescue PDFKit::ImproperWkhtmltopdfExitStatus => e
      Rails.logger.error(
        'Case::Pdf wkhtmltopdf_failed ' \
        "case_id=#{case_study.id} case_slug=#{case_study.slug} " \
        "root_url=#{root_url} " \
        "wkhtmltopdf_command=#{kit&.command&.inspect} " \
        "error=#{e.message}"
      )
      raise
    end

    def html
      renderer.render(
        SOURCE_VIEW_PATH,
        layout: 'print',
        assigns: { case: case_study }
      )
    end

    def renderer
      ActionController::Base.asset_host = root_url.to_s.chomp('/')

      defaults = {
        http_host: "#{root_url.host}:#{root_url.port}",
        https: root_url.scheme == 'https',
        'action_dispatch.request.path_parameters' => {
          controller: 'cases',
          action: 'show'
        }
      }
      ApplicationController.renderer.with_defaults(defaults).new
    end

    def options
      {
        root_url: root_url.to_s,
        protocol: root_url.scheme,
        load_error_handling: 'ignore',
        load_media_error_handling: 'ignore'
      }
    end
  end
end
