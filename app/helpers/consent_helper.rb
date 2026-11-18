# frozen_string_literal: true

# Decides whether a visitor has to be asked before Gala keeps anything in
# their browser, and whether they have already answered (register item J1,
# A15).
#
# The answer lives in a first-party cookie. That cookie is the record of the
# choice itself, so it is strictly necessary and needs no consent of its own.
module ConsentHelper
  CONSENT_COOKIE = :gala_consent
  GRANTED = 'granted'
  DENIED = 'denied'

  # Memoised because a render asks more than once, and each call is an mmdb
  # lookup. The view context is per request, so this never outlives one.
  def consent_required?
    return @consent_required if defined?(@consent_required)

    @consent_required = GeoIp.consent_required?(request.remote_ip)
  end

  # @return [String, nil] 'granted', 'denied', or nil when unanswered. An
  #   unrecognised value is treated as unanswered rather than trusted.
  def consent_decision
    value = cookies[CONSENT_COOKIE]
    value if [GRANTED, DENIED].include?(value)
  end

  def show_consent_banner?
    consent_required? && consent_decision.nil?
  end

  # Withdrawing has to be as easy as consenting was, so a visitor who has
  # answered gets a way back to the question. Only those who were asked see
  # it: outside the EU, EEA and UK there is no choice on record to change.
  def show_consent_withdrawal?
    consent_required? && consent_decision.present?
  end

  # Visitors outside the EU, EEA and UK are tracked as before; inside it,
  # only after they say yes. Unanswered means no, because consent has to come
  # before the thing it permits, not after.
  def tracking_allowed?
    return true unless consent_required?

    consent_decision == GRANTED
  end
end
