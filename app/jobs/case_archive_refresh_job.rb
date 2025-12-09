# frozen_string_literal: true

# Create a PDF from a case and attach it to the case archive
class CaseArchiveRefreshJob < ApplicationJob
  queue_as :default

  def perform(archive, root_url:)
    Rails.logger.info(
      "CaseArchiveRefreshJob#perform start " \
      "archive_id=#{archive.id} " \
      "case_id=#{archive.case_id} " \
      "case_slug=#{archive.case.slug}"
    )

    pdf = Case::Pdf.new(
      archive.case,
      root_url: root_url
    ).file
    filename = "#{archive.case.slug}.pdf"
    archive.pdf.attach(
      io: StringIO.new(pdf),
      filename: filename
    )

    Rails.logger.info(
      "CaseArchiveRefreshJob#perform success " \
      "archive_id=#{archive.id} " \
      "case_id=#{archive.case_id} " \
      "case_slug=#{archive.case.slug}"
    )
  rescue StandardError => e
    Rails.logger.error(
      "CaseArchiveRefreshJob#perform error " \
      "archive_id=#{archive.id} " \
      "case_id=#{archive.case_id} " \
      "case_slug=#{archive.case.slug} " \
      "error=#{e.class}: #{e.message}"
    )

    Sentry.capture_exception(
      e,
      extra: {
        archive_id: archive.id,
        case_id: archive.case_id,
        case_slug: archive.case.slug,
        root_url: root_url
      }
    )

    raise
  end
end
