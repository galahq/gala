# frozen_string_literal: true

module Readers
  # Tier 1, step two: the scrub the sweep runs once a closed account's grace
  # period has passed (register A10, A22; feasibility doc §5).
  #
  # The reader row is kept so every foreign key stays valid. Its identity is
  # replaced, its access removed, and the relationships that are personal and
  # carry no weight for anyone else are deleted. What stays, attributed to the
  # pseudonymized row: forum comments and threads, reading lists (A12), visits
  # and events (E1 is open), and quiz answers unless the B1 flag says
  # otherwise. Authored cases stay published with their bylines, which are
  # case data (A16); co-editors and site admins keep access (A2, A11).
  #
  # This is pseudonymization, not erasure: the register is explicit that it
  # does not discharge an Art. 17 request on its own. Tier 2 is a person.
  class AnonymizeAccount
    class AlreadyAnonymized < StandardError; end

    PLACEHOLDER_DOMAIN = 'deleted.invalid'

    # Personal, and carrying no weight for anyone else once the reader is gone.
    # Editorships and managerships go too: co-editors and site admins keep
    # the case (A2, A11), and bylines are case data (A16).
    DESTROYED = %i[
      locks enrollments group_memberships invitations reply_notifications
      sent_reply_notifications case_library_requests spotlight_acknowledgements
      reading_list_saves editorships managerships
    ].freeze

    # Someone else's record that merely pointed back at this reader.
    UNLINKED = { sent_invitations: :inviter_id, authored_quizzes: :author_id }.freeze

    def self.call(reader, now: Time.current,
                  purge_quiz_answers: Rails.configuration.x.purge_quiz_answers_on_closure)
      new(reader, now: now, purge_quiz_answers: purge_quiz_answers).call
    end

    def initialize(reader, now: Time.current, purge_quiz_answers: false)
      @reader = reader
      @now = now
      @purge_quiz_answers = purge_quiz_answers
    end

    # @return [Reader] the anonymized reader
    def call
      raise AlreadyAnonymized, "reader #{@reader.id} is already anonymized" if @reader.anonymized?

      # Before anything is destroyed, so the EditsChannel broadcast still has
      # a lock to announce (noted in the #798 review).
      CleanupLocksJob.perform_now(reader_id: @reader.id)
      ActiveRecord::Base.transaction { anonymize }
      @reader.image.purge_later if @reader.image.attached?
      @reader.reload
    end

    private

    def anonymize
      remove_access
      remove_relationships
      purge_quiz_answers if @purge_quiz_answers
      scrub_identity
      @reader.pending_account_deletion_request&.update!(completed_at: @now)
    end

    def remove_access
      @reader.authentication_strategies.destroy_all
      @reader.roles.clear
    end

    def remove_relationships
      DESTROYED.each { |association| @reader.public_send(association).destroy_all }
      UNLINKED.each { |association, column| @reader.public_send(association).update_all(column => nil) }
    end

    def purge_quiz_answers
      @reader.answers.destroy_all
      @reader.submissions.destroy_all
    end

    # update_columns on purpose: no validations, no callbacks, and above all
    # no Devise reconfirmation email to an address that is being removed.
    def scrub_identity
      @reader.update_columns(identity_columns.merge(credential_columns).merge(bookkeeping_columns))
    end

    def identity_columns
      {
        name: Reader.deleted_name, initials: nil,
        email: "deleted-#{SecureRandom.uuid}@#{PLACEHOLDER_DOMAIN}", unconfirmed_email: nil,
        image_url: nil, current_sign_in_ip: nil, last_sign_in_ip: nil,
        send_reply_notifications: false, active_community_id: nil
      }
    end

    def credential_columns
      {
        encrypted_password: Devise::Encryptor.digest(Reader, SecureRandom.base58(32)),
        reset_password_token: nil, reset_password_sent_at: nil, remember_created_at: nil,
        confirmation_token: nil, confirmation_sent_at: nil
      }
    end

    def bookkeeping_columns
      { closed_at: @reader.closed_at || @now, anonymized_at: @now, updated_at: @now }
    end
  end
end
