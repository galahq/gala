# frozen_string_literal: true

require 'open3'
require 'shellwords'

class GalaWkhtmltopdf
  class CommandError < StandardError
    attr_reader :command, :stderr, :status

    def initialize(command:, stderr:, status: nil)
      @command = command
      @stderr = stderr
      @status = status

      super("wkhtmltopdf failed#{": #{stderr}" if stderr.present?}")
    end
  end

  class HTMLPreprocessor
    ASSET_ATTRIBUTE = /
      (?<attribute>\b(?:href|src)=)
      (?<quote>["'])
      (?<url>\/(?!\/)[^"']*)
      \k<quote>
    /x

    def self.process(html, root_url, _protocol = nil)
      root = root_url.to_s

      html.to_s.gsub(ASSET_ATTRIBUTE) do
        attribute = ::Regexp.last_match(:attribute)
        quote = ::Regexp.last_match(:quote)
        url = ::Regexp.last_match(:url).delete_prefix('/')

        "#{attribute}#{quote}#{root}#{url}#{quote}"
      end
    end
  end

  attr_reader :html, :options, :command

  def initialize(html, options = {})
    @html = html
    @options = options
    @command = build_command
  end

  def to_pdf
    stdout, stderr, status = Open3.capture3(*command, stdin_data: processed_html)
    return stdout if status.success?

    raise CommandError.new(command: command, stderr: stderr, status: status)
  rescue Errno::ENOENT => e
    raise CommandError.new(command: command, stderr: e.message)
  end

  private

  def processed_html
    HTMLPreprocessor.process(
      html,
      options.fetch(:root_url, ''),
      options.fetch(:protocol, nil)
    )
  end

  def build_command
    [
      ENV.fetch('WKHTMLTOPDF_BINARY', 'wkhtmltopdf'),
      '--quiet',
      '--dpi', options.fetch(:dpi, 300).to_s,
      '--load-error-handling', options.fetch(:load_error_handling, 'ignore').to_s,
      '--load-media-error-handling', options.fetch(:load_media_error_handling, 'ignore').to_s,
      '-', '-'
    ]
  end
end
