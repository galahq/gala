# frozen_string_literal: true

# Controller for proxying GitHub Pages to enable iframe embedding
# Bypasses X-Frame-Options restrictions
class GithubPagesController < ApplicationController
  before_action :validate_url, only: [:show]
  skip_before_action :verify_authenticity_token, only: [:assets]
  before_action :set_cors_headers

  # @route [GET] /github_pages?url=https://...
  def show
    fetched_response = fetch_github_pages_content
    return head :not_found unless fetched_response

    # Set headers to allow embedding
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; style-src 'self' 'unsafe-inline' https: http:; img-src 'self' data: https: http:; connect-src 'self' https: http:; font-src 'self' https: http: data:;"
    
    # Cache the response for performance
    expires_in 1.hour, public: true
    
    # Rewrite asset URLs to use our proxy
    Rails.logger.info "Rewriting asset URLs for base URL: #{@url}"
    rewritten_content = rewrite_asset_urls(fetched_response.body, @url)
    Rails.logger.info "Content after rewriting: #{rewritten_content[0..500]}..."
    
    # For large documents, stream the response
    if fetched_response.content_length && fetched_response.content_length > 5.megabytes
      response.headers['Content-Length'] = rewritten_content.length.to_s
      render html: rewritten_content.html_safe
    else
      render html: rewritten_content.html_safe
    end
  end

  # @route [GET] /github_pages_assets/*path
  def assets
    # Get the base URL from the URL parameter
    base_url = params[:url]
    return head :bad_request unless base_url

    # Construct the asset URL properly
    asset_path = params[:path]
    # Rails strips the file extension from params[:path] and puts it in params[:format]
    # We need to reconstruct the full filename
    if params[:format].present?
      full_filename = "#{asset_path}.#{params[:format]}"
    else
      full_filename = asset_path
    end
    
    # Determine if this is an index_files asset or a regular file
    base_uri = URI.parse(base_url)
    if full_filename.include?('index_files/')
      # This is already an index_files path, use it as-is
      full_asset_path = full_filename
    else
      # Check if the original base URL points to a directory that might have index_files
      # For Quarto sites, try index_files first, then fall back to direct path
      if base_uri.path.end_with?('/') || base_uri.path.include?('/quarto/')
        # Try index_files first for Quarto sites
        full_asset_path = "index_files/#{full_filename}"
      else
        # Use direct path for regular GitHub Pages
        full_asset_path = full_filename
      end
    end
    
    # Construct the full asset URL properly
    if base_uri.path.end_with?('/')
      # Base URL ends with /, so we can append the asset path directly
      base_uri.path = base_uri.path + full_asset_path
    else
      # Base URL doesn't end with /, so we need to add it
      base_uri.path = base_uri.path + '/' + full_asset_path
    end
    asset_url = base_uri.to_s
    
    Rails.logger.info "Asset request: #{asset_path} from #{base_url}"
    Rails.logger.info "Full filename: #{full_filename}"
    Rails.logger.info "Fetching asset from: #{asset_url}"
    
    # Fetch the asset
    asset_response = fetch_asset(asset_url)
    
    # If not found and we tried index_files, try direct path
    if !asset_response && full_asset_path.start_with?('index_files/')
      Rails.logger.info "Asset not found in index_files, trying direct path"
      # Reconstruct the base URI to avoid double path issues
      base_uri = URI.parse(base_url)
      if base_uri.path.end_with?('/')
        base_uri.path = base_uri.path + full_filename
      else
        base_uri.path = base_uri.path + '/' + full_filename
      end
      asset_url = base_uri.to_s
      Rails.logger.info "Trying direct path: #{asset_url}"
      asset_response = fetch_asset(asset_url)
    end
    
    # If still not found and we used direct path, try index_files
    if !asset_response && !full_asset_path.start_with?('index_files/')
      Rails.logger.info "Asset not found in direct path, trying index_files"
      # Reconstruct the base URI to avoid double path issues
      base_uri = URI.parse(base_url)
      if base_uri.path.end_with?('/')
        base_uri.path = base_uri.path + 'index_files/' + full_filename
      else
        base_uri.path = base_uri.path + '/index_files/' + full_filename
      end
      asset_url = base_uri.to_s
      Rails.logger.info "Trying index_files path: #{asset_url}"
      asset_response = fetch_asset(asset_url)
    end
    
    return head :not_found unless asset_response

    # Set appropriate headers with proper MIME type detection
    content_type = determine_content_type(full_filename, asset_response['Content-Type'])
    response.headers['Content-Type'] = content_type
    response.headers['Cache-Control'] = 'public, max-age=3600'
    
    render body: asset_response.body
  end

  private

  def validate_url
    @url = params[:url]
    Rails.logger.info "GitHub Pages proxy request for URL: #{@url}"
    return head :bad_request if @url.blank?

    begin
      uri = URI.parse(@url)
      Rails.logger.info "Parsed URI host: #{uri.host}"
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        Rails.logger.warn "Invalid URI scheme: #{uri.scheme}"
        head :bad_request
        return
      end

      # Only allow specific domains for security
      allowed_domains = allowed_github_pages_domains
      Rails.logger.info "Allowed domains: #{allowed_domains}"
      unless allowed_domains.any? { |domain| uri.host.include?(domain) }
        Rails.logger.warn "Domain not allowed: #{uri.host}"
        head :forbidden
        return
      end
    rescue URI::InvalidURIError => e
      Rails.logger.error "Invalid URI: #{e.message}"
      head :bad_request
    end
  end

  def allowed_github_pages_domains
    # Only allow the specific trusted domain for now
    %w[
      ocelots-rcn.github.io
    ]
  end

  def fetch_github_pages_content
    uri = URI.parse(@url)
    Rails.logger.info "Fetching content from: #{uri}"
    
    # Use Net::HTTP with timeout and size limits for security
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    http.read_timeout = 10
    http.open_timeout = 5
    
    request = Net::HTTP::Get.new(uri)
    request['User-Agent'] = 'Gala GitHub Pages Proxy/1.0'
    request['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    
    response = http.request(request)
    Rails.logger.info "Response status: #{response.code}, Content-Type: #{response['Content-Type']}, Content-Length: #{response.content_length}"
    
    # Check response size limit (50MB for GitHub Pages documents)
    if response.content_length && response.content_length > 50.megabytes
      Rails.logger.warn "GitHub Pages document too large: #{@url} (#{response.content_length} bytes)"
      return nil
    end
    
    # Only allow HTML content
    content_type = response['Content-Type']&.split(';')&.first
    unless content_type&.include?('text/html')
      Rails.logger.warn "GitHub Pages document not HTML: #{@url} (#{content_type})"
      return nil
    end
    
    Rails.logger.info "Content preview: #{response.body[0..200]}..."
    response
  rescue => e
    Rails.logger.error "Failed to fetch GitHub Pages document #{@url}: #{e.message}"
    nil
  end

  def fetch_asset(asset_url)
    uri = URI.parse(asset_url)
    Rails.logger.info "Fetching asset from: #{uri}"
    
    # Use Net::HTTP with timeout and size limits for security
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    http.read_timeout = 10
    http.open_timeout = 5
    
    request = Net::HTTP::Get.new(uri)
    request['User-Agent'] = 'Gala GitHub Pages Proxy/1.0'
    
    response = http.request(request)
    Rails.logger.info "Asset response status: #{response.code}, Content-Type: #{response['Content-Type']}, Content-Length: #{response.content_length}"
    
    # Handle 404 and other error responses
    unless response.code.to_i == 200
      Rails.logger.warn "Asset request failed: #{asset_url} (HTTP #{response.code})"
      return nil
    end
    
    # Check response size limit (10MB for assets)
    if response.content_length && response.content_length > 10.megabytes
      Rails.logger.warn "Asset too large: #{asset_url} (#{response.content_length} bytes)"
      return nil
    end
    
    response
  rescue => e
    Rails.logger.error "Failed to fetch asset #{asset_url}: #{e.message}"
    nil
  end


  def rewrite_asset_urls(content, base_url)
    # Rewrite relative asset URLs to use our proxy
    base_uri = URI.parse(base_url)
    base_path = base_uri.path.chomp('/')
    
    # Rewrite src attributes for all relative URLs (handle both quoted and unquoted)
    content = content.gsub(/src=(?:"([^"]*)"|'([^']*)'|([^"'\s>]+))/) do |match|
      asset_path = $1 || $2 || $3
      
      # Skip if it's already a full URL or data URI
      next match if asset_path.start_with?('http://', 'https://', 'data:', 'mailto:', '#')
      
      # Handle index_files paths (remove the prefix since we'll add it back in assets controller)
      if asset_path.include?('index_files/')
        clean_path = asset_path.gsub(/^\/?index_files\//, '')
      else
        clean_path = asset_path
      end
      
      if clean_path.start_with?('/')
        # Absolute path
        proxy_url = "/github_pages_assets#{clean_path}?url=#{CGI.escape(base_url)}"
      else
        # Relative path
        proxy_url = "/github_pages_assets/#{clean_path}?url=#{CGI.escape(base_url)}"
      end
      "src=\"#{proxy_url}\""
    end
    
    # Rewrite href attributes for all relative URLs (handle both quoted and unquoted)
    content = content.gsub(/href=(?:"([^"]*)"|'([^']*)'|([^"'\s>]+))/) do |match|
      asset_path = $1 || $2 || $3
      
      # Skip if it's already a full URL or data URI
      next match if asset_path.start_with?('http://', 'https://', 'data:', 'mailto:', '#')
      
      # Handle index_files paths (remove the prefix since we'll add it back in assets controller)
      if asset_path.include?('index_files/')
        clean_path = asset_path.gsub(/^\/?index_files\//, '')
      else
        clean_path = asset_path
      end
      
      if clean_path.start_with?('/')
        # Absolute path
        proxy_url = "/github_pages_assets#{clean_path}?url=#{CGI.escape(base_url)}"
      else
        # Relative path
        proxy_url = "/github_pages_assets/#{clean_path}?url=#{CGI.escape(base_url)}"
      end
      "href=\"#{proxy_url}\""
    end
    
    content
  end

  def set_cors_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    headers['Access-Control-Allow-Credentials'] = 'true'
  end

  def determine_content_type(asset_path, original_content_type)
    # Use the original content type if it's valid and not text/html
    if original_content_type && !original_content_type.include?('text/html')
      return original_content_type
    end

    # Determine MIME type based on file extension
    case File.extname(asset_path).downcase
    when '.js'
      'application/javascript'
    when '.mjs'
      'application/javascript'
    when '.css'
      'text/css'
    when '.html', '.htm'
      'text/html'
    when '.json'
      'application/json'
    when '.png'
      'image/png'
    when '.jpg', '.jpeg'
      'image/jpeg'
    when '.gif'
      'image/gif'
    when '.svg'
      'image/svg+xml'
    when '.woff'
      'font/woff'
    when '.woff2'
      'font/woff2'
    when '.ttf'
      'font/ttf'
    when '.eot'
      'application/vnd.ms-fontobject'
    else
      # Default to text/plain for unknown types
      'text/plain'
    end
  end
end
