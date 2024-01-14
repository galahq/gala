# frozen_string_literal: true

class CaseLibraryRequest < ApplicationRecord
  belongs_to :case
  belongs_to :library
  belongs_to :requester, class_name: 'Reader'

  enum status: { pending: 'pending',
                 accepted: 'accepted',
                 rejected: 'rejected' }

  after_create_commit do
    library.managers.each {|m| LibraryRequestMailer.notify(self, m).deliver_later }
  end
end
