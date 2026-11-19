# frozen_string_literal: true

# Decides whether a visitor has to be asked before Gala keeps anything in
# their browser, and whether they have already answered (register item J1,
# A15).
#
# This is a controller concern rather than a view helper because the answer
# changes the response itself and not only its markup. A page that carries a
# consent decision is about one visitor, so it cannot be stored in a shared
# cache or revalidated to a 304 — the caching in CasesController,
# CatalogController and Cases::StatsController has to be able to see this.
module Consent
  extend ActiveSupport::Concern

  CONSENT_COOKIE = :gala_consent
  REOPEN_COOKIE = :gala_consent_reopen
  GRANTED = 'granted'
  DENIED = 'denied'

  included do
    helper_method :consent_required?, :consent_decision, :show_consent_banner?,
                  :show_consent_withdrawal?, :tracking_allowed?
  end

  # Memoised because one request asks several times and each call is an mmdb
  # lookup.
  def consent_required?
    return @consent_required if defined?(@consent_required)

    @consent_required = GeoIp.consent_required?(consent_remote_ip)
  end

  # @return [String, nil] 'granted', 'denied', or nil when unanswered. An
  #   unrecognised value is treated as unanswered rather than trusted.
  def consent_decision
    value = cookies[CONSENT_COOKIE]
    value if [GRANTED, DENIED].include?(value)
  end

  # Reopening shows the question again without withdrawing the answer, so
  # someone who only wants to look at it keeps whatever they chose until they
  # actually choose something else.
  def consent_reopened?
    cookies[REOPEN_COOKIE].present?
  end

  def show_consent_banner?
    consent_required? && (consent_decision.nil? || consent_reopened?)
  end

  # Hidden while the banner itself is up: a second route to a question already
  # on the screen is just noise.
  def show_consent_withdrawal?
    consent_required? && consent_decision.present? && !consent_reopened?
  end

  # Visitors outside the EU, EEA and UK are tracked as before; inside it, only
  # after they say yes. Unanswered means no, because consent has to come
  # before the thing it permits.
  def tracking_allowed?
    return true unless consent_required?

    consent_decision == GRANTED
  end

  # Whether this response is about one visitor rather than all of them. True
  # for anyone in scope, whatever they answered, because the markup carries
  # the banner, the Mapbox token and the GALA_CONSENT flag. Outside the EU,
  # EEA and UK every visitor gets identical bytes and the existing caching is
  # untouched.
  def consent_varies_response?
    consent_required? && !request.format.json?
  end

  # Distinguishes the shapes a page can take, for the server-side render
  # cache. Only the consent state matters here, never the visitor: everyone
  # out of scope shares one entry and everyone in scope shares one per answer,
  # so the expensive part -- rendering -- is still cached for everybody.
  #
  # HTTP caching is a different question, and consent_varies_response? answers
  # it, because a browser or CDN keys on the URL and can see none of this.
  def consent_cache_token
    return 'consent:n/a' unless consent_required?

    ['consent', consent_decision || 'unanswered',
     consent_reopened? ? 'reopen' : nil].compact.join(':')
  end

  # A caveat for whoever puts a CDN in front of this. Out-of-scope responses
  # stay publicly cacheable because every out-of-scope visitor gets identical
  # bytes — but "out of scope" is decided here, from the address, and a shared
  # cache keyed only on the URL would hand one of those cached pages to an EU
  # visitor and skip this logic entirely. A CDN in front of Gala has to vary
  # on viewer country, or these pages have to stop being public. Heroku serves
  # these directly today, so nothing is wrong right now.

  private

  # ActionDispatch::RemoteIp raises IpSpoofAttackError lazily, on read, when
  # Client-IP and X-Forwarded-For disagree. Until this change the only read
  # was inside Ahoy's own path; it now runs on every HTML render, so two
  # headers would otherwise turn every page into a 500. An address we cannot
  # trust is an address we cannot place, and GeoIp already treats that as
  # "ask".
  def consent_remote_ip
    request.remote_ip
  rescue ActionDispatch::RemoteIp::IpSpoofAttackError
    nil
  end
end
