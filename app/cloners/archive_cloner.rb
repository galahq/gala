# @see Archive
class ArchiveCloner < Clowne::Cloner
  include_attached :pdf

  finalize do |source, record, kase:, **|
    record.case = kase
    if source.pdf.attached? && source.pdf.blob
      record.pdf.attach(source.pdf.blob)
    end
    record.save validate: false
  end
end
