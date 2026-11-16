# frozen_string_literal: true

module Readers
  # Replaces the person's name with "[Deleted user]" in one reply by someone
  # else that names them, keeping the rest of that person's words (register
  # O8). It is the label the thread already shows on their own, erased posts,
  # so a reader can see who the reply was addressed to without learning who
  # that was. Their name in someone else's post is still their personal data; the
  # reply itself is the other person's. Run from the erasure confirmation page
  # before erasing, while the account still has a name to look for.
  #
  # Only a reply {ErasureMentions} lists can be changed, and only where it
  # matched, so this can't be pointed at an arbitrary comment. update_columns
  # leaves updated_at alone and skips the touch, as {EraseComments} does: the
  # reply isn't shown as "(edited)" and its thread isn't lifted in the forum.
  class RemoveNameFromReply
    # The reply isn't one the confirmation page lists for this person.
    class NotAMention < StandardError; end

    def self.call(reader, comment_id)
      new(reader, comment_id).call
    end

    def initialize(reader, comment_id)
      @mentions = ErasureMentions.new(reader)
      @comment_id = comment_id
    end

    # @return [Comment] the reply, with the name replaced in every language
    #   it was stored in
    def call
      comment = @mentions.find(@comment_id) or raise NotAMention
      stored = comment.read_attribute(:content)
      content = if stored.is_a?(Hash)
                  stored.to_h { |locale, text| [locale, remove_name(text, locale)] }
                else
                  remove_name(stored, I18n.default_locale)
                end
      comment.update_columns(content: content)
      comment
    end

    private

    # In the reply's own language, matching how that language shows the
    # account ({Reader.deleted_name}), in brackets to mark the edit.
    def remove_name(text, locale)
      text.to_s.gsub(@mentions.ruby_pattern, "[#{deleted_name(locale)}]")
    end

    def deleted_name(locale)
      english = I18n.t('readers.deleted_name', locale: :en)
      I18n.t('readers.deleted_name', locale: locale, default: english)
    rescue I18n::InvalidLocale
      english
    end
  end
end
