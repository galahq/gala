# frozen_string_literal: true

class Case
  # A PDF archive of a case and all its pages, podcasts, and edgenotes
  class Pdf
    SOURCE_VIEW_PATH = 'cases/show.pdf.erb'

    EAGER_LOADING_CONFIG = [
      :cards,
      edgenotes: [
        audio_attachment: :blob,
        file_attachment: :blob,
        image_attachment: :blob
      ],
      case_elements: :element
    ].freeze

    attr_reader :case_study, :root_url

    def initialize(case_study, root_url:)
      @case_study = preload_associations(case_study).decorate
      @root_url = URI(root_url)
    end

    def file
      @file ||= generate_pdf
    end

    private

    def preload_associations(case_study)
      ActiveRecord::Associations::Preloader
        .new.preload(case_study, EAGER_LOADING_CONFIG)

      case_study
    end

    def generate_pdf
      PDFKit.new(html, options).to_pdf
    end

    def html
      renderer.render(
        SOURCE_VIEW_PATH,
        layout: 'layouts/print.html.erb',
        assigns: { case: case_study }
      )
    end

    def renderer
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
        footer_left: @case_study.license_config['name'],
        footer_font_size: 8,
      }
    end
  end
end
