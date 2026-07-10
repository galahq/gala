# frozen_string_literal: true

# Selects request-local Google OAuth credentials during OmniAuth setup.
class GoogleOauthSetup
  SELECTION_KEY = 'gala.google_oauth_client_selection'
  MIGRATION_EMAIL_KEY = 'gala.google_oauth_migration_email'
  INVALID_MIGRATION_CLIENT_ID = 'invalid-google-migration-client-id'
  INVALID_MIGRATION_CLIENT_SECRET = 'invalid-google-migration-client-secret'

  class << self
    def call(env)
      new(env).call
    end
  end

  def initialize(env)
    @env = env
    @request = Rack::Request.new(env)
    @session = env.fetch('rack.session')
    @options = env.fetch('omniauth.strategy').options
  end

  def call
    callback? ? configure_callback : configure_authorization
  end

  private

  def configure_authorization
    requested_email = normalize(@request.GET['reader_email'])
    selection = if migration_authorization?(requested_email)
                  'migration'
                else
                  'legacy'
                end

    @session[SELECTION_KEY] = selection
    apply_credentials(selection)
  end

  def configure_callback
    selection = @session.delete(SELECTION_KEY)

    if selection == 'migration'
      apply_migration_callback_credentials
      saved_params = @session['omniauth.params'] || {}
      @env[MIGRATION_EMAIL_KEY] = normalize(saved_params['reader_email'])
    else
      apply_credentials('legacy')
    end
  end

  def migration_authorization?(requested_email)
    return false unless migration_credentials_complete?

    reader = Reader.find_by('LOWER(email) = ?', requested_email)
    reader&.google_oauth_migration_allowed? || false
  end

  def apply_credentials(selection)
    id, secret = if selection == 'migration'
                   migration_credentials
                 else
                   legacy_credentials
                 end
    @options[:client_id] = id
    @options[:client_secret] = secret
  end

  def apply_migration_callback_credentials
    if migration_credentials_complete?
      apply_credentials('migration')
    else
      @options[:client_id] = INVALID_MIGRATION_CLIENT_ID
      @options[:client_secret] = INVALID_MIGRATION_CLIENT_SECRET
    end
  end

  def legacy_credentials
    [ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET']]
  end

  def migration_credentials
    [ENV['GOOGLE_MIGRATION_CLIENT_ID'],
     ENV['GOOGLE_MIGRATION_CLIENT_SECRET']]
  end

  def migration_credentials_complete?
    migration_credentials.all?(&:present?)
  end

  def normalize(email)
    email.to_s.strip.downcase
  end

  def callback?
    @request.path.end_with?('/callback')
  end
end
