# frozen_string_literal: true

class Case
  # A record holding on to a PDF archive of a case
  class Archive < ApplicationRecord
    belongs_to :case
    has_one_attached :pdf

    def needs_refresh?
      updated_at.before?(self.case.max_updated_at)
    end

    # The archive is fresh if the PDF is ready to be downloaded. It can be
    # non-fresh if it needs refresh or if the refresh hasn’t finished processing
    def fresh?
      !needs_refresh? &&
        pdf.attached? && pdf.created_at.after?(self.case.max_updated_at)
    end

    def refresh!(root_url:)
      touch
      CaseArchiveRefreshJob.perform_later(self, root_url: root_url)
    end
  end
end
