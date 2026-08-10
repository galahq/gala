# frozen_string_literal: true

require 'digest'

# @see Case
class CasesController < ApplicationController
  include BroadcastEdits
  include PublicCatalogCache
  include SelectionParams
  include VerifyLock

  CASE_EAGER_LOADING_CONFIG = [
    :cards,
    { podcasts: [
        :card, :case_element,
        { audio_attachment: :blob,
          artwork_attachment: :blob }
      ],
      edgenotes: [
        image_attachment: :blob,
        audio_attachment: :blob,
        file_attachment: :blob
      ],
      pages: %i[case_element cards] }
  ].freeze

  before_action :authenticate_reader!, except: %i[index show]
  before_action :set_case, only: %i[show edit update destroy]
  before_action -> { verify_lock_on @case }, only: %i[update destroy]

  broadcast_edits to: :@case

  layout 'admin'

  CASE_SHOW_CACHE_TTL = 2.minutes
  CASE_SHOW_SIGNED_IN_CACHE_TTL = 30.seconds

  # @route [GET] `/cases`
  def index
    @cases = policy_scope(Case)
             .ordered
             .with_attached_cover_image
             .includes(:library, :tags)
             .decorate

    if anonymous_json_catalog_request?
      render_public_catalog_json(
        [
          'cases-preview',
          I18n.locale.to_s,
          catalog_cache_timestamp(Case),
          catalog_cache_timestamp(Library),
          catalog_cache_timestamp(Tag)
        ],
        json: @cases,
        each_serializer: Cases::PreviewSerializer
      )
      return
    end

    render json: @cases, each_serializer: Cases::PreviewSerializer
  end

  # @route [GET] `/cases/slug`
  def show
    authenticate_reader! unless @case.published
    authorize @case
    set_group_and_deployment

    cache_signature = case_show_cache_signature
    set_case_show_cache_headers
    # Anonymous responses are publicly cacheable; they must not also set a
    # session cookie (mirrors render_public_catalog_json).
    request.session_options[:skip] = true unless reader_signed_in?
    return unless stale?(
      etag: cache_signature[:cache_etag],
      last_modified: cache_signature[:latest_at]
    )

    respond_to do |format|
      format.html { render html: cached_case_show_html(cache_signature), layout: false }
      format.json do
        render body: cached_case_show_json(cache_signature),
               content_type: 'application/json'
      end
    end
  end

  # @route [POST] `/cases`
  def create
    @case = current_reader.my_cases.build create_case_params
    if @case.save
      redirect_to edit_case_path(@case), notice: successfully_created
    else
      @case.errors.delete(:slug)
      render :new
    end
  end

  # @route [GET] `/cases/slug/edit`
  def edit
    authorize @case
    redirect_to case_path @case, edit: true
  end

  # @route [PATCH/PUT] `/cases/slug`
  def update
    authorize @case
    set_group_and_deployment
    if @case.update(update_case_params)
      preload_case_associations!
      render json: @case, serializer: Cases::ShowSerializer,
             deployment: @deployment, enrollment: @enrollment
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/cases/slug`
  def destroy
    redirect_to case_confirm_deletion_path @case and return
    authorize @case
    @case.destroy!
    redirect_to my_cases_path, notice: successfully_destroyed
  end

  # @route [GET] `/cases/slug/copy`
  def copy
    current_case = Case.friendly.find(slug)
    CaseCloneJob.perform_later current_case, locale: current_case.locale
    redirect_to my_cases_path, notice: successfully_copied
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_case
    @case = Case.friendly.find(slug).decorate
  end

  # The full card/page/podcast/edgenote graph (with attachment blobs) is only
  # needed when a response body is actually rendered. A 304 revalidation or a
  # Rails.cache hit never touches it, so it is loaded at render time inside the
  # cache-miss blocks instead of in a before_action.
  def preload_case_associations!
    ActiveRecord::Associations::Preloader.new(
      records: [@case.object], associations: CASE_EAGER_LOADING_CONFIG
    ).call
  end

  def slug
    params[:slug] || params[:case_slug]
  end

  def set_group_and_deployment
    @enrollment = current_user.enrollment_for_case @case
    @group = @enrollment.try(:active_group) || GlobalGroup.new
    @deployment = @group.deployment_for_case @case
  end

  def case_show_cache_signature
    latest = @case.max_updated_at || @case.updated_at
    latest_at = latest&.utc
    deployment_cache_key = if @deployment.respond_to?(:cache_key)
                            @deployment&.cache_key
                          elsif @deployment.respond_to?(:id) && @deployment.respond_to?(:updated_at)
                            "#{@deployment.class.name}-#{@deployment.id}-#{@deployment.updated_at.to_i}"
                          else
                            @deployment.class.name
                          end
    enrollment_cache_key = if @enrollment.respond_to?(:cache_key)
                            @enrollment&.cache_key
                          elsif @enrollment.respond_to?(:id) && @enrollment.respond_to?(:updated_at)
                            "#{@enrollment.class.name}-#{@enrollment.id}-#{@enrollment.updated_at.to_i}"
                          else
                            @enrollment.class.name
                          end

    {
      latest_at: latest_at,
      cache_key: [
        @case.id,
        latest.to_i,
        @case.locale,
        deployment_cache_key,
        enrollment_cache_key
      ].join('-'),
      cache_etag: [
        I18n.locale.to_s,
        case_show_cache_format,
        @case.id,
        latest.to_i,
        deployment_cache_key,
        enrollment_cache_key,
        case_show_cache_reader_key(include_session: !request.format.json?)
      ].join('-')
    }
  end

  def case_show_cache_format
    request.format.symbol || request.format.ref || request.format.to_s
  end

  def case_show_cache_reader_key(include_session: true)
    return 'anon:anonymous' unless reader_signed_in?

    parts = [
      'reader', current_reader.cache_key,
      "persona-#{current_reader.persona}",
      "reader-roles-#{case_show_reader_role_names}",
      "reader-role-#{case_show_reader_role_group}",
      "enrollment-#{@enrollment&.cache_key || 'none'}",
      "case_request-#{case_show_request_for_case_status}"
    ]
    parts << "session-#{case_show_session_key}" if include_session
    parts.join(':')
  end

  # The cached signed-in HTML embeds session-bound state (csrf_meta_tags,
  # window.reader), so its ETag and Rails.cache fragment must not outlive the
  # session that rendered them. The JSON variant contains no session-bound
  # state, so it omits the session segment and is reusable across sessions of
  # the same reader.
  def case_show_session_key
    session_id = request.session.id
    return 'none' if session_id.blank?

    Digest::SHA256.hexdigest(session_id.to_s)[0, 16]
  end

  def case_show_reader_role_names
    return 'none' unless current_reader

    current_reader.roles
                .pluck(:name)
                .sort
                .join('|')
                .presence || 'none'
  end

  def case_show_reader_role_group
    return 'editor' if current_reader.has_cached_role?(:editor)
    return 'case_editor' if case_show_reader_case_editor?
    return 'case_manager' if case_show_reader_case_manager?

    'reader'
  end

  def case_show_reader_case_editor?
    @case_show_reader_case_editor ||=
      current_reader.my_cases.where(id: @case.id).exists?
  end

  def case_show_reader_case_manager?
    @case_show_reader_case_manager ||=
      current_reader.managed_cases.where(id: @case.id).exists?
  end

  def case_show_request_for_case_status
    @case_show_request_for_case_status ||=
      current_reader.request_for_case(@case)&.status || 'none'
  end

  def case_show_cache_ttl
    return CASE_SHOW_SIGNED_IN_CACHE_TTL if reader_signed_in?

    CASE_SHOW_CACHE_TTL
  end

  def case_show_cache_key(cache_signature)
    variant = cache_signature[:cache_variant] || 'html'
    [
      ENV.fetch('RAILS_ENV', 'production'),
      'cases',
      'show',
      variant,
      cache_signature[:cache_key],
      case_show_cache_reader_key(include_session: variant == 'html'),
      I18n.locale.to_s
    ].join('/')
  end

  # max-age=0 forces browsers to revalidate on every use (a cheap 304 via the
  # ETag), so an auth transition — signing in or out — can never surface a
  # cached page rendered under the previous auth state. Shared caches (the
  # future CloudFront distribution) still cache for s-maxage; signed-in
  # responses are no-store and never reach them.
  def case_show_cache_headers
    {
      cache_control: "public, max-age=0, s-maxage=#{case_show_cache_ttl.to_i}",
      vary: 'Accept, Accept-Language, Accept-Encoding'
    }
  end

  def set_case_show_cache_headers
    # Signed-in responses embed per-session state (csrf_meta_tags,
    # window.reader) and must never land in a browser or shared cache.
    if reader_signed_in?
      response.headers['Cache-Control'] = 'no-store'
      return
    end

    headers = case_show_cache_headers
    response.headers['Cache-Control'] = headers[:cache_control]
    response.headers['Vary'] = headers[:vary]
  end

  def cached_case_show_html(cache_signature)
    Rails.cache.fetch(
      case_show_cache_key(cache_signature.merge(cache_variant: 'html')),
      expires_in: case_show_cache_ttl
    ) do
      preload_case_associations!
      render_to_string(layout: 'with_header', formats: :html)
    end
  end

  def cached_case_show_json(cache_signature)
    render_options = {
      json: @case,
      serializer: Cases::ShowSerializer,
      view_context: view_context,
      deployment: @deployment,
      enrollment: @enrollment
    }
    render_options[:current_user] = current_reader if reader_signed_in?

    Rails.cache.fetch(
      case_show_cache_key(cache_signature.merge(cache_variant: 'json')),
      expires_in: case_show_cache_ttl
    ) do
      preload_case_associations!
      render_to_string(**render_options)
    end
  end

  # Only allow a trusted parameter "white list" through.
  def create_case_params
    params.require(:case).permit(:locale)
  end

  def update_case_params
    params.require(:case).permit(
      :published, :kicker, :title, :dek, :photo_credit, :summary, :tags,
      :cover_image, :teaching_guide, :latitude, :longitude, :zoom,
      :acknowledgements,
      authors: %i[name institution], translators: [], learning_objectives: []
    )
  end
end
