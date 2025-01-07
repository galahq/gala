# frozen_string_literal: true

# Create a PDF from a case and attach it to the case archive
class CaseArchiveRefreshJob < ActiveJob::Base
  def perform(archive, root_url:)
    pdf = Case::Pdf.new(archive.case, root_url: root_url).file
    filename = "#{archive.case.slug} - #{Date.today}.pdf"
    archive.pdf.attach io: StringIO.new(pdf), filename: filename
  end
end
