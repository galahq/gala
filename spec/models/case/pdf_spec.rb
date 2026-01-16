# frozen_string_literal: true

require 'rails_helper'
require 'rbconfig'

RSpec.describe Case::Pdf do
  describe 'root_url normalization' do
    it 'demonstrates why a trailing slash matters for PDFKit URL rewriting' do
      html = '<img src="/assets/foo.png">'

      # PDFKit concatenates root_url + path; if root_url lacks a trailing slash,
      # it will produce malformed URLs like https://learngala.comassets/foo.png.
      broken =
        PDFKit::HTMLPreprocessor.process(html, 'https://learngala.com', 'https')
      expect(broken).to include('src="https://learngala.comassets/foo.png"')

      pdf = described_class.allocate
      fixed_root_url = pdf.send(:ensure_trailing_slash, 'https://learngala.com')
      expect(fixed_root_url).to eq('https://learngala.com/')

      fixed =
        PDFKit::HTMLPreprocessor.process(html, fixed_root_url, 'https')
      expect(fixed).to include('src="https://learngala.com/assets/foo.png"')
    end
  end

  describe '#options' do
    it 'configures wkhtmltopdf to ignore load errors for archive PDFs' do
      pdf = described_class.allocate
      pdf.instance_variable_set(:@root_url, URI('https://learngala.com/'))

      options = pdf.send(:options)
      expect(options[:load_error_handling]).to eq('ignore')
      expect(options[:load_media_error_handling]).to eq('ignore')
    end
  end

  describe 'logging' do
    it 'logs the wkhtmltopdf command when wkhtmltopdf exits non-zero' do
      pdf = described_class.allocate
      pdf.instance_variable_set(:@root_url, URI('https://learngala.com/'))
      pdf.instance_variable_set(
        :@case_study,
        instance_double(Case, id: 2703, slug: 'case-slug')
      )
      allow(pdf).to receive(:html).and_return('<html></html>')

      kit =
        instance_double(
          PDFKit,
          command: ['wkhtmltopdf', '--quiet'],
          to_pdf: nil
        )
      # PDFKit::ImproperWkhtmltopdfExitStatus uses `$?.exitstatus` to build its
      # message; ensure `$?` is set for this example.
      system(RbConfig.ruby, '-e', 'exit 1')
      error =
        PDFKit::ImproperWkhtmltopdfExitStatus.new(['wkhtmltopdf', '--quiet'])
      allow(kit).to receive(:to_pdf).and_raise(error)

      allow(PDFKit).to receive(:new).and_return(kit)
    end
  end
end
