# @see Archive
class ArchiveCloner < Clowne::Cloner
  include_associations :pdf

  finalize do |source, record, **params|
    record.case = params[:kase]
    if source.pdf.attached? && source.pdf.blob
      record.pdf.attach(source.pdf.blob)
    end
    record.save validate: false
  end
end
