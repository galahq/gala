# frozen_string_literal: true

# Sends a reader's {Readers::ExportAccount} as a download, a piece at a time
# as Postgres builds it. Used by the reader's own Your data page and by the
# admin reader page.
module SendsAccountExport
  extend ActiveSupport::Concern

  private

  def send_account_export(reader)
    export = Readers::ExportAccount.new(reader, file_url: ->(file) { rails_blob_url(file, disposition: 'attachment') })
    Rails.logger.info "Account export: reader #{reader.id}, requested by reader #{current_reader.id}"

    set_export_headers export.filename
    self.response_body = export.each
  end

  def set_export_headers(filename)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    response.headers['Content-Disposition'] =
      ActionDispatch::Http::ContentDisposition.format(disposition: 'attachment', filename: filename)
    # Personal data: never kept by a browser or proxy cache.
    response.headers['Cache-Control'] = 'no-store'
    # Without it Rack::ETag reads the whole body to hash it, which builds the
    # entire file in memory inside the request timeout before a byte is sent.
    response.headers['Last-Modified'] = Time.current.httpdate
  end
end
