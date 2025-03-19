module Wikidata
  module Utils
    def self.humanize_date(date_string)
      date_string = date_string.gsub(/^\+/, '') if date_string.start_with?('+')
      DateTime.parse(date_string).strftime('%B %d, %Y')
    rescue
      date_string
    end

    def self.humanize_sparql_subject(subject)
      if subject.match?(/^P\d+$/)
        subject
      elsif subject == subject.upcase
        subject
      else
        subject.gsub(/([a-z])([A-Z])/, '\1 \2').humanize
      end
    end

    def self.format_claim_value(value)
      case value
      when String
        { type: 'string', value: value }
      when Hash
        case value[:type]
        when :string
          { type: 'string', value: value[:value].to_s }
        when :monolingualtext
          { type: 'monolingualtext', value: { text: value[:value].to_s, language: value[:language] || 'en' } }
        when :quantity
          { type: 'quantity', value: { amount: value[:value].to_s, unit: value[:unit] || '1' } }
        when :time
          iso_date = value[:value].to_s
          {
            type: 'time',
            value: {
              time: iso_date.start_with?('+') ? iso_date : "+#{iso_date}",
              timezone: 0,
              before: 0,
              after: 0,
              precision: value[:precision] || 11,
              calendarmodel: 'http://www.wikidata.org/entity/Q1985727'
            }
          }
        when :wikibase-entityid
          { type: 'wikibase-entityid', value: { id: value[:value].to_s } }
        else
          { type: 'string', value: value[:value].to_s }
        end
      else
        { type: 'string', value: value.to_s }
      end
    end

    def self.format_properties_for_cache(properties)
      properties.map do |property_id, value|
        if value.is_a?(Hash)
          { property_id => value[:value] }
        elsif value.is_a?(Array)
          { property_id => value.map { |v| v.is_a?(Hash) ? v[:value] : v } }
        else
          { property_id => value }
        end
      end
    end

    def self.format_datetime(datetime)
      datetime&.iso8601
    end

    def self.map_locale_to_language_qid(locale)
      language_qid_map = {
        'en' => 'Q1860',   # English
        'es' => 'Q1321',   # Spanish
        'fr' => 'Q150',    # French
        'de' => 'Q188',    # German
        'it' => 'Q652',    # Italian
        'pt' => 'Q5146',   # Portuguese
        'ru' => 'Q7737',   # Russian
        'zh' => 'Q7850',   # Chinese
        'ja' => 'Q5287',   # Japanese
        'ar' => 'Q13955',  # Arabic
      }

      language_qid_map[locale] || 'Q1860'
    end

    def self.map_license_to_qid(license)
      license_qid_map = {
        'all_rights_reserved' => 'Q27935507', # All Rights Reserved (copyright)
        'cc_by_nc' => 'Q24082749',           # CC BY-NC 4.0
        'cc_by_nc_nd' => 'Q24082750'         # CC BY-NC-ND 4.0
      }

      license_qid_map[license] || 'Q27935507'
    end
  end
end
