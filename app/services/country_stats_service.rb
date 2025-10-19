# frozen_string_literal: true

# Service to aggregate and format country statistics for the stats dashboard
class CountryStatsService
  # ISO2 to ISO3 mapping for common countries
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
    'GY' => 'GUY', 'FK' => 'FLK', 'GF' => 'GUF', 'ZA' => 'ZAF', 'NG' => 'NGA',
    'EG' => 'EGY', 'KE' => 'KEN', 'ET' => 'ETH', 'GH' => 'GHA', 'DZ' => 'DZA',
    'MA' => 'MAR', 'TN' => 'TUN', 'LY' => 'LBY', 'SD' => 'SDN', 'UG' => 'UGA',
    'TZ' => 'TZA', 'ZW' => 'ZWE', 'BW' => 'BWA', 'MZ' => 'MOZ', 'ZM' => 'ZMB',
    'MW' => 'MWI', 'AO' => 'AGO', 'NA' => 'NAM', 'SN' => 'SEN', 'ML' => 'MLI',
    'BF' => 'BFA', 'NE' => 'NER', 'TD' => 'TCD', 'MR' => 'MRT', 'GM' => 'GMB',
    'GN' => 'GIN', 'SL' => 'SLE', 'LR' => 'LBR', 'CI' => 'CIV', 'TG' => 'TGO',
    'BJ' => 'BEN', 'GW' => 'GNB', 'ER' => 'ERI', 'SO' => 'SOM', 'DJ' => 'DJI',
    'KM' => 'COM', 'SC' => 'SYC', 'MG' => 'MDG', 'MU' => 'MUS', 'RE' => 'REU',
    'TH' => 'THA', 'VN' => 'VNM', 'PH' => 'PHL', 'ID' => 'IDN', 'MY' => 'MYS',
    'SG' => 'SGP', 'MM' => 'MMR', 'KH' => 'KHM', 'LA' => 'LAO', 'TL' => 'TLS',
    'BN' => 'BRN', 'PG' => 'PNG', 'FJ' => 'FJI', 'SB' => 'SLB', 'VU' => 'VUT',
    'NC' => 'NCL', 'PF' => 'PYF', 'NZ' => 'NZL', 'TW' => 'TWN', 'HK' => 'HKG',
    'MO' => 'MAC', 'MN' => 'MNG', 'KP' => 'PRK', 'PK' => 'PAK', 'BD' => 'BGD',
    'LK' => 'LKA', 'NP' => 'NPL', 'BT' => 'BTN', 'MV' => 'MDV', 'AF' => 'AFG',
    'TJ' => 'TJK', 'KG' => 'KGZ', 'UZ' => 'UZB', 'TM' => 'TKM', 'KZ' => 'KAZ',
    'IR' => 'IRN', 'IQ' => 'IRQ', 'SA' => 'SAU', 'YE' => 'YEM', 'OM' => 'OMN',
    'AE' => 'ARE', 'QA' => 'QAT', 'KW' => 'KWT', 'BH' => 'BHR', 'IL' => 'ISR',
    'JO' => 'JOR', 'LB' => 'LBN', 'SY' => 'SYR', 'PS' => 'PSE', 'TR' => 'TUR',
    'AM' => 'ARM', 'GE' => 'GEO', 'AZ' => 'AZE', 'UA' => 'UKR', 'BY' => 'BLR',
    'MD' => 'MDA', 'RS' => 'SRB', 'BA' => 'BIH', 'ME' => 'MNE', 'MK' => 'MKD',
    'AL' => 'ALB', 'XK' => 'XKX', 'IS' => 'ISL', 'GL' => 'GRL', 'FO' => 'FRO',
    'BM' => 'BMU', 'CR' => 'CRI', 'PR' => 'PRI'
  }.freeze

  # Country names mapping (matching GeoJSON names)
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
    'BM' => 'Bermuda', 'CR' => 'Costa Rica', 'PR' => 'Puerto Rico'
  }.freeze

  def self.format_country_stats(raw_stats)
    # Calculate percentiles for color distribution
    all_visits = raw_stats.map { |r| r['unique_visits'] || 0 }.sort
    return { stats: [], percentiles: [] } if all_visits.empty?

    percentiles = calculate_percentiles(all_visits)

    # Format each country's data
    stats = raw_stats.map do |row|
      iso2 = (row['country'] || '').upcase
      visits = row['unique_visits'] || 0

      {
        iso2: iso2,
        iso3: ISO2_TO_ISO3[iso2] || iso2,
        name: COUNTRY_NAMES[iso2] || row['country'] || 'Unknown',
        unique_visits: visits,
        unique_users: row['unique_users'] || 0,
        events_count: row['events_count'] || 0,
        first_event: row['first_event'],
        last_event: row['last_event'],
        deployments_count: row['deployments_count'] || 0,
        visit_podcast_count: row['visit_podcast_count'] || 0,
        visit_edgenote_count: row['visit_edgenote_count'] || 0,
        visit_page_count: row['visit_page_count'] || 0,
        visit_element_count: row['visit_element_count'] || 0,
        read_quiz_count: row['read_quiz_count'] || 0,
        read_overview_count: row['read_overview_count'] || 0,
        read_card_count: row['read_card_count'] || 0,
        write_comment_count: row['write_comment_count'] || 0,
        write_comment_thread_count: row['write_comment_thread_count'] || 0,
        write_quiz_submission_count: row['write_quiz_submission_count'] || 0,
        percentile: get_percentile(visits, percentiles)
      }
    end

    {
      stats: stats.sort_by { |s| -s[:unique_visits] },
      percentiles: percentiles,
      total_visits: all_visits.sum,
      country_count: stats.count,
      total_deployments: stats.sum { |s| s[:deployments_count] },
      total_podcast_listens: stats.sum { |s| s[:visit_podcast_count] }
    }
  end

  def self.calculate_percentiles(values)
    return [] if values.empty?

    sorted_values = values.sort
    min_val = sorted_values.first
    max_val = sorted_values.last

    # Calculate 5 percentiles ensuring unique values using averages
    percentiles = [0, 25, 50, 75, 100].map do |percentile|
      case percentile
      when 0
        # 0th percentile: minimum value
        value = min_val
      when 100
        # 100th percentile: maximum value
        value = max_val
      else
        # For intermediate percentiles, calculate average between percentile points
        # This ensures we get unique values even with limited data
        lower_percentile = percentile - 12.5
        upper_percentile = percentile + 12.5

        lower_index = (lower_percentile / 100.0 * (sorted_values.length - 1)).round
        upper_index = (upper_percentile / 100.0 * (sorted_values.length - 1)).round

        lower_val = sorted_values[lower_index] || min_val
        upper_val = sorted_values[upper_index] || max_val

        # Use average to ensure uniqueness
        value = ((lower_val + upper_val) / 2.0).round
      end

      {
        percentile: percentile,
        value: value,
        color: get_color_for_percentile(percentile)
      }
    end

    # Final pass to ensure all values are unique by adjusting duplicates
    ensure_unique_values(percentiles)
  end

  def self.ensure_unique_values(percentiles)
    # Sort by percentile to process in order
    sorted_percentiles = percentiles.sort_by { |p| p[:percentile] }

    # Ensure uniqueness by incrementing duplicate values
    (1...sorted_percentiles.length).each do |i|
      current = sorted_percentiles[i]
      previous = sorted_percentiles[i - 1]

      current[:value] = previous[:value] + 1 if current[:value] <= previous[:value]
    end

    sorted_percentiles
  end

  def self.get_percentile(value, percentiles)
    return 0 if value.zero?

    percentiles.reverse.each do |p|
      return p[:percentile] if value >= p[:value]
    end

    0
  end

  def self.get_color_for_percentile(percentile)
    # Custom blue shades for 5 percentiles
    colors = [
      '#E2FDFF', # 0% - Very light cyan-blue
      '#BFD7FF', # 25% - Light blue
      '#9BB1FF', # 50% - Medium blue
      '#788BFF', # 75% - Medium-dark blue
      '#5465FF'  # 100% - Dark blue
    ]

    # Map percentiles to color indices: 0->0, 25->1, 50->2, 75->3, 100->4
    index = case percentile
            when 0 then 0
            when 25 then 1
            when 50 then 2
            when 75 then 3
            when 100 then 4
            else 0
            end

    colors[index] || colors.first
  end
end
