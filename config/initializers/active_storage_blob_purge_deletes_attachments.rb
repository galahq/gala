# frozen_string_literal: true

# In Rails < 6, attachment changes are persisted as soon as they are assigned,
# regardless of whether the record they’re attached to is successfully saved.
# That’s why Rails < 6 doesn’t support validation of attachments. We need to,
# but the model is left in an inconsistent state if validation fails: the old
# blob is deleted as soon as the new attachment is assigned, but if validation
# fails the old attachment is preserved, and points to a dead blob.
Rails.configuration.to_prepare do
  throw StandardError 'Unnecessary and bad' unless Rails.version.start_with? '5'

  ActiveStorage::Blob.class_eval do
    alias_method :__old_purge, :purge

    def purge
      attachments.each(&:delete)
      __old_purge
    end
  end
end
