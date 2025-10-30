# frozen_string_literal: true

# Service to aggregate and format country statistics for the stats dashboard
class CountryStatsService
  ISO2_TO_ISO3 = {
    'US' => 'USA', 'GB' => 'GBR', 'CA' => 'CAN', 'AU' => 'AUS', 'DE' => 'DEU',
    'FR' => 'FRA', 'IT' => 'ITA', 'ES' => 'ESP', 'JP' => 'JPN', 'CN' => 'CHN',
    'IN' => 'IND', 'BR' => 'BRA', 'MX' => 'MEX', 'RU' => 'RUS', 'KR' => 'KOR',
    'NL' => 'NLD', 'CH' => 'CHE', 'SE' => 'SWE', 'NO' => 'NOR', 'DK' => 'DNK',
    'FI' => 'FIN', 'BE' => 'BEL', 'AT' => 'AUT', 'PL' => 'POL', 'CZ' => 'CZE',
    'PT' => 'PRT', 'GR' => 'GRC', 'HU' => 'HUN', 'IE' => 'IRL', 'RO' => 'ROU',
    'BG' => 'BGR', 'HR' => 'HRV', 'SK' => 'SVK', 'SI' => 'SVN', 'LT' => 'LTU',
    'LV' => 'LVA', 'EE' => 'EST', 'LU' => 'LUX', 'MT' => 'MLT', 'CY' => 'CYP',
    'AR' => 'ARG', 'CL' => 'CHL', 'CO' => 'COL', 'PE' => 'PER', 'VE' => 'VEN',
    'UY' => 'URY', 'PY' => 'PRY', 'BO' => 'BOL', 'EC' => 'ECU', 'SR' => 'SUR',
    'GY' => 'GUY', 'ZA' => 'ZAF', 'NG' => 'NGA', 'EG' => 'EGY', 'KE' => 'KEN',
    'ET' => 'ETH', 'GH' => 'GHA', 'DZ' => 'DZA', 'MA' => 'MAR', 'TN' => 'TUN',
    'LY' => 'LBY', 'SD' => 'SDN', 'UG' => 'UGA', 'TZ' => 'TZA', 'ZW' => 'ZWE',
    'BW' => 'BWA', 'MZ' => 'MOZ', 'ZM' => 'ZMB', 'MW' => 'MWI', 'AO' => 'AGO',
    'NA' => 'NAM', 'SN' => 'SEN', 'ML' => 'MLI', 'BF' => 'BFA', 'NE' => 'NER',
    'TD' => 'TCD', 'MR' => 'MRT', 'GM' => 'GMB', 'GN' => 'GIN', 'SL' => 'SLE',
    'LR' => 'LBR', 'CI' => 'CIV', 'TG' => 'TGO', 'BJ' => 'BEN', 'GW' => 'GNB',
    'ER' => 'ERI', 'SO' => 'SOM', 'DJ' => 'DJI', 'KM' => 'COM', 'SC' => 'SYC',
    'MG' => 'MDG', 'MU' => 'MUS', 'RE' => 'REU', 'TH' => 'THA', 'VN' => 'VNM',
    'PH' => 'PHL', 'ID' => 'IDN', 'MY' => 'MYS', 'SG' => 'SGP', 'MM' => 'MMR',
    'KH' => 'KHM', 'LA' => 'LAO', 'TL' => 'TLS', 'BN' => 'BRN', 'PG' => 'PNG',
    'FJ' => 'FJI', 'SB' => 'SLB', 'VU' => 'VUT', 'NC' => 'NCL', 'PF' => 'PYF',
    'NZ' => 'NZL', 'TW' => 'TWN', 'HK' => 'HKG', 'MO' => 'MAC', 'MN' => 'MNG',
    'KP' => 'PRK', 'PK' => 'PAK', 'BD' => 'BGD', 'LK' => 'LKA', 'NP' => 'NPL',
    'BT' => 'BTN', 'MV' => 'MDV', 'AF' => 'AFG', 'TJ' => 'TJK', 'KG' => 'KGZ',
    'UZ' => 'UZB', 'TM' => 'TKM', 'KZ' => 'KAZ', 'IR' => 'IRN', 'IQ' => 'IRQ',
    'SA' => 'SAU', 'YE' => 'YEM', 'OM' => 'OMN', 'AE' => 'ARE', 'QA' => 'QAT',
    'KW' => 'KWT', 'BH' => 'BHR', 'IL' => 'ISR', 'JO' => 'JOR', 'LB' => 'LBN',
    'SY' => 'SYR', 'PS' => 'PSE', 'TR' => 'TUR', 'AM' => 'ARM', 'GE' => 'GEO',
    'AZ' => 'AZE', 'UA' => 'UKR', 'BY' => 'BLR', 'MD' => 'MDA', 'RS' => 'SRB',
    'BA' => 'BIH', 'ME' => 'MNE', 'MK' => 'MKD', 'AL' => 'ALB', 'IS' => 'ISL',
    'GL' => 'GRL', 'FO' => 'FRO', 'BM' => 'BMU', 'CR' => 'CRI', 'PR' => 'PRI'
  }.freeze

  COUNTRY_NAMES = {
    'US' => 'United States of America', 'GB' => 'United Kingdom', 'CA' => 'Canada',
    'AU' => 'Australia', 'DE' => 'Germany', 'FR' => 'France', 'IT' => 'Italy',
    'ES' => 'Spain', 'JP' => 'Japan', 'CN' => 'China', 'IN' => 'India',
    'BR' => 'Brazil', 'MX' => 'Mexico', 'RU' => 'Russia', 'KR' => 'South Korea',
    'NL' => 'Netherlands', 'CH' => 'Switzerland', 'SE' => 'Sweden', 'NO' => 'Norway',
    'DK' => 'Denmark', 'FI' => 'Finland', 'BE' => 'Belgium', 'AT' => 'Austria',
    'PL' => 'Poland', 'CZ' => 'Czech Republic', 'PT' => 'Portugal', 'GR' => 'Greece',
    'HU' => 'Hungary', 'IE' => 'Ireland', 'RO' => 'Romania', 'BG' => 'Bulgaria',
    'HR' => 'Croatia', 'SK' => 'Slovakia', 'SI' => 'Slovenia', 'LT' => 'Lithuania',
    'LV' => 'Latvia', 'EE' => 'Estonia', 'LU' => 'Luxembourg', 'MT' => 'Malta',
    'CY' => 'Cyprus', 'AR' => 'Argentina', 'CL' => 'Chile', 'CO' => 'Colombia',
    'PE' => 'Peru', 'VE' => 'Venezuela', 'UY' => 'Uruguay', 'PY' => 'Paraguay',
    'BO' => 'Bolivia', 'EC' => 'Ecuador', 'ZA' => 'South Africa', 'NG' => 'Nigeria',
    'EG' => 'Egypt', 'KE' => 'Kenya', 'ET' => 'Ethiopia', 'GH' => 'Ghana',
    'TH' => 'Thailand', 'VN' => 'Vietnam', 'PH' => 'Philippines', 'ID' => 'Indonesia',
    'MY' => 'Malaysia', 'SG' => 'Singapore', 'TW' => 'Taiwan', 'HK' => 'Hong Kong',
    'NZ' => 'New Zealand', 'IL' => 'Israel', 'AE' => 'United Arab Emirates',
    'SA' => 'Saudi Arabia', 'TR' => 'Turkey', 'UA' => 'Ukraine', 'PK' => 'Pakistan',
    'BD' => 'Bangladesh', 'LK' => 'Sri Lanka', 'NP' => 'Nepal',
    'BM' => 'Bermuda', 'CR' => 'Costa Rica', 'PR' => 'Puerto Rico',
    'KZ' => 'Kazakhstan', 'RS' => 'Serbia', 'BN' => 'Brunei',
    'SY' => 'Syria'
  }.freeze

  # Precompute mappings for name lookups (first two words, lowercase)
  NORMALIZED_NAME_TO_ISO2 = COUNTRY_NAMES.each_with_object({}) do |(iso2, name), h|
    normalized = name.downcase.split[0..1].join(' ')
    h[normalized] = iso2
  end.freeze

  def self.resolve_country(input)
    return { iso2: nil, iso3: nil, name: 'Unknown' } if input.nil? || input.strip.empty?

    input_up = input.strip.upcase
    input_down = input.strip.downcase

    if ISO2_TO_ISO3.key?(input_up) # ISO2 input
      iso2 = input_up
      iso3 = ISO2_TO_ISO3[iso2]
      name = COUNTRY_NAMES[iso2]
    elsif ISO2_TO_ISO3.value?(input_up) # ISO3 input
      iso3 = input_up
      iso2 = ISO2_TO_ISO3.key(iso3)
      name = COUNTRY_NAMES[iso2]
    else
      # Normalize full name: take first two words lowercase
      normalized_name = input_down.split[0..1].join(' ')
      iso2 = NORMALIZED_NAME_TO_ISO2[normalized_name]
      if iso2
        iso3 = ISO2_TO_ISO3[iso2]
        name = COUNTRY_NAMES[iso2]
      else
        # Fallback: unknown
        iso2 = input_up
        iso3 = input_up
        name = input
      end
    end

    { iso2: iso2, iso3: iso3, name: name }
  end

  def self.merge_stats(raw_stats)
    merged = raw_stats.each_with_object({}) do |row, h|
      c = resolve_country(row['country'])
      key = c[:iso2] || row['country'] || 'Unknown'

      h[key] ||= {
        iso2: c[:iso2],
        iso3: c[:iso3],
        name: c[:name],
        unique_visits: 0,
        unique_users: 0,
        events_count: 0,
        deployments_count: 0,
        visit_podcast_count: 0,
        visit_edgenote_count: 0,
        visit_page_count: 0,
        visit_element_count: 0,
        read_quiz_count: 0,
        read_overview_count: 0,
        read_card_count: 0,
        write_comment_count: 0,
        write_comment_thread_count: 0,
        write_quiz_submission_count: 0,
        first_event: nil,
        last_event: nil
      }

      h[key][:unique_visits] += row['unique_visits'] || 0
      h[key][:unique_users] += row['unique_users'] || 0
      h[key][:events_count] += row['events_count'] || 0
      h[key][:deployments_count] += row['deployments_count'] || 0
      h[key][:visit_podcast_count] += row['visit_podcast_count'] || 0
      h[key][:visit_edgenote_count] += row['visit_edgenote_count'] || 0
      h[key][:visit_page_count] += row['visit_page_count'] || 0
      h[key][:visit_element_count] += row['visit_element_count'] || 0
      h[key][:read_quiz_count] += row['read_quiz_count'] || 0
      h[key][:read_overview_count] += row['read_overview_count'] || 0
      h[key][:read_card_count] += row['read_card_count'] || 0
      h[key][:write_comment_count] += row['write_comment_count'] || 0
      h[key][:write_comment_thread_count] += row['write_comment_thread_count'] || 0
      h[key][:write_quiz_submission_count] += row['write_quiz_submission_count'] || 0
      h[key][:first_event] ||= row['first_event']
      h[key][:last_event] = [h[key][:last_event], row['last_event']].compact.max
    end

    merged.values
  end

  def self.calculate_percentiles(values)
    return [] if values.empty?

    sorted = values.sort
    min_val = sorted.first
    max_val = sorted.last

    percentiles = [0, 25, 50, 75, 100].map do |p|
      case p
      when 0 then { percentile: 0, value: min_val, color: get_color_for_percentile(0) }
      when 100 then { percentile: 100, value: max_val, color: get_color_for_percentile(100) }
      else
        idx_low = ((p - 12.5) / 100.0 * (sorted.length - 1)).round
        idx_high = ((p + 12.5) / 100.0 * (sorted.length - 1)).round
        val = ((sorted[idx_low] || min_val) + (sorted[idx_high] || max_val)) / 2.0
        { percentile: p, value: val.round, color: get_color_for_percentile(p) }
      end
    end

    (1...percentiles.length).each do |i|
      percentiles[i][:value] = percentiles[i - 1][:value] + 1 if percentiles[i][:value] < percentiles[i - 1][:value]
    end

    percentiles
  end

  def self.get_percentile(value, percentiles)
    return 0 if value.zero?

    percentiles.reverse.each { |p| return p[:percentile] if value >= p[:value] }
    0
  end

  def self.get_color_for_percentile(percentile)
    # Use shades of purple (base: #7c3aed / rgb(124, 58, 237))
    # with alpha channel increasing from 0.2 to 1.0
    colors = [
      'rgba(124, 58, 237, 0.2)',
      'rgba(124, 58, 237, 0.4)',
      'rgba(124, 58, 237, 0.6)',
      'rgba(124, 58, 237, 0.8)',
      'rgba(124, 58, 237, 1.0)'
    ]
    case percentile
    when 0 then colors[0]
    when 25 then colors[1]
    when 50 then colors[2]
    when 75 then colors[3]
    when 100 then colors[4]
    else colors[0]
    end
  end

  def self.format_country_stats(raw_stats)
    merged_stats = merge_stats(raw_stats)
    all_visits = merged_stats.map { |r| r[:unique_visits] || 0 }.sort
    percentiles = calculate_percentiles(all_visits)

    formatted = merged_stats.map do |row|
      visits = row[:unique_visits] || 0
      row.merge(percentile: get_percentile(visits, percentiles))
    end

    {
      stats: formatted.sort_by { |s| -s[:unique_visits] },
      percentiles: percentiles,
      total_visits: all_visits.sum,
      country_count: formatted.size,
      total_deployments: formatted.sum { |s| s[:deployments_count] },
      total_podcast_listens: formatted.sum { |s| s[:visit_podcast_count] }
    }
  end
end
