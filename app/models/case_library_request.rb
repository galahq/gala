# frozen_string_literal: true

# A request from a reader to a library to be able to access a case within
# Only library managers can accept or reject a request.
# Any author can initiate a request.
class CaseLibraryRequest < ApplicationRecord
  enum status: { pending: 'pending',
                 accepted: 'accepted',
                 rejected: 'rejected' }

  belongs_to :case
  belongs_to :library
  belongs_to :requester, class_name: 'Reader'

  after_create_commit do
    library.managers.each do |m|
      LibraryRequestMailer.notify(self, m).deliver_later
    end
  end
end
