class ReaderAuthorizer < ApplicationAuthorizer
  def updatable_by? reader
    byebug
    resource == reader || super
  end
end
