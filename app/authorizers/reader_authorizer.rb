class ReaderAuthorizer < ApplicationAuthorizer
  def updatable_by? reader
    resource == reader || super
  end
end
