# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GithubPagesController, type: :controller do
  describe 'GET #show' do
    let(:valid_github_pages_url) { 'https://ocelots-rcn.github.io/my-page.html' }
    let(:interactive_github_pages_url) { 'https://ocelots-rcn.github.io/serengeti_cont_by_species/quarto/' }
    let(:invalid_url) { 'https://malicious-site.com/evil.html' }
    let(:non_html_url) { 'https://ocelots-rcn.github.io/document.pdf' }

    context 'with valid GitHub Pages URL' do
      before do
        # Mock the HTTP request
        allow(Net::HTTP).to receive(:new).and_return(double('http').tap do |http|
          allow(http).to receive(:use_ssl=)
          allow(http).to receive(:read_timeout=)
          allow(http).to receive(:open_timeout=)
        allow(http).to receive(:request).and_return(
          double('response').tap do |response|
            allow(response).to receive(:code).and_return('200')
            allow(response).to receive(:headers).and_return({ 'Content-Type' => 'text/html' })
            allow(response).to receive(:[]).with('Content-Type').and_return('text/html')
            allow(response).to receive(:content_length).and_return(1024)
            allow(response).to receive(:body).and_return('<html><body>Test GitHub Pages Document</body></html>')
          end
        )
        end)
      end

      it 'returns the proxied content' do
        get :show, params: { url: valid_github_pages_url }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('Test GitHub Pages Document')
      end

      it 'sets appropriate headers for embedding' do
        get :show, params: { url: valid_github_pages_url }
        expect(response.headers['X-Frame-Options']).to eq('SAMEORIGIN')
        expect(response.headers['Content-Security-Policy']).to include("frame-ancestors 'self'")
      end
    end

    context 'with interactive GitHub Pages document' do
      before do
        allow(Net::HTTP).to receive(:new).and_return(double('http').tap do |http|
          allow(http).to receive(:use_ssl=)
          allow(http).to receive(:read_timeout=)
          allow(http).to receive(:open_timeout=)
          allow(http).to receive(:request).and_return(
            double('response').tap do |response|
              allow(response).to receive(:code).and_return('200')
              allow(response).to receive(:headers).and_return({ 'Content-Type' => 'text/html' })
              allow(response).to receive(:[]).with('Content-Type').and_return('text/html')
              allow(response).to receive(:content_length).and_return(2048)
              allow(response).to receive(:body).and_return(<<~HTML)
                <html>
                  <head>
                    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                  </head>
                  <body>
                    <div id="plot"></div>
                    <script>
                      Plotly = require("https://cdn.plot.ly/plotly-latest.min.js");
                      // Interactive plotting code
                    </script>
                  </body>
                </html>
              HTML
            end
          )
        end)
      end

      it 'allows interactive GitHub Pages documents with external scripts' do
        get :show, params: { url: interactive_github_pages_url }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('plotly-latest.min.js')
        expect(response.body).to include('Plotly = require')
      end

      it 'preserves interactive elements' do
        get :show, params: { url: interactive_github_pages_url }
        expect(response.body).to include('<div id="plot">')
        expect(response.body).to include('<script>')
      end
    end

    context 'with invalid URL' do
      it 'returns bad request for blank URL' do
        get :show, params: { url: '' }
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns forbidden for non-allowed domain' do
        get :show, params: { url: invalid_url }
        expect(response).to have_http_status(:forbidden)
      end

      it 'returns bad request for invalid URI' do
        get :show, params: { url: 'not-a-url' }
        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'with non-HTML content' do
      before do
        allow(Net::HTTP).to receive(:new).and_return(double('http').tap do |http|
          allow(http).to receive(:use_ssl=)
          allow(http).to receive(:read_timeout=)
          allow(http).to receive(:open_timeout=)
        allow(http).to receive(:request).and_return(
          double('response').tap do |response|
            allow(response).to receive(:code).and_return('200')
            allow(response).to receive(:headers).and_return({ 'Content-Type' => 'application/pdf' })
            allow(response).to receive(:[]).with('Content-Type').and_return('application/pdf')
            allow(response).to receive(:content_length).and_return(1024)
          end
        )
        end)
      end

      it 'returns not found for non-HTML content' do
        get :show, params: { url: non_html_url }
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
