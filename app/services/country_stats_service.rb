# frozen_string_literal: true

# Service to aggregate and format country statistics for the stats dashboard
class CountryStatsService
  ISO2_TO_ISO3 = {
    'AD' => 'AND', 'AE' => 'ARE', 'AF' => 'AFG', 'AG' => 'ATG', 'AI' => 'AIA',
    'AL' => 'ALB', 'AM' => 'ARM', 'AO' => 'AGO', 'AQ' => 'ATA', 'AR' => 'ARG',
    'AS' => 'ASM', 'AT' => 'AUT', 'AU' => 'AUS', 'AW' => 'ABW', 'AX' => 'ALA',
    'AZ' => 'AZE', 'BA' => 'BIH', 'BB' => 'BRB', 'BD' => 'BGD', 'BE' => 'BEL',
    'BF' => 'BFA', 'BG' => 'BGR', 'BH' => 'BHR', 'BI' => 'BDI', 'BJ' => 'BEN',
    'BL' => 'BLM', 'BM' => 'BMU', 'BN' => 'BRN', 'BO' => 'BOL', 'BQ' => 'BES',
    'BR' => 'BRA', 'BS' => 'BHS', 'BT' => 'BTN', 'BV' => 'BVT', 'BW' => 'BWA',
    'BY' => 'BLR', 'BZ' => 'BLZ', 'CA' => 'CAN', 'CC' => 'CCK', 'CD' => 'COD',
    'CF' => 'CAF', 'CG' => 'COG', 'CH' => 'CHE', 'CI' => 'CIV', 'CK' => 'COK',
    'CL' => 'CHL', 'CM' => 'CMR', 'CN' => 'CHN', 'CO' => 'COL', 'CR' => 'CRI',
    'CU' => 'CUB', 'CV' => 'CPV', 'CW' => 'CUW', 'CX' => 'CXR', 'CY' => 'CYP',
    'CZ' => 'CZE', 'DE' => 'DEU', 'DJ' => 'DJI', 'DK' => 'DNK', 'DM' => 'DMA',
    'DO' => 'DOM', 'DZ' => 'DZA', 'EC' => 'ECU', 'EE' => 'EST', 'EG' => 'EGY',
    'EH' => 'ESH', 'ER' => 'ERI', 'ES' => 'ESP', 'ET' => 'ETH', 'FI' => 'FIN',
    'FJ' => 'FJI', 'FK' => 'FLK', 'FM' => 'FSM', 'FO' => 'FRO', 'FR' => 'FRA',
    'GA' => 'GAB', 'GB' => 'GBR', 'GD' => 'GRD', 'GE' => 'GEO', 'GF' => 'GUF',
    'GG' => 'GGY', 'GH' => 'GHA', 'GI' => 'GIB', 'GL' => 'GRL', 'GM' => 'GMB',
    'GN' => 'GIN', 'GP' => 'GLP', 'GQ' => 'GNQ', 'GR' => 'GRC', 'GS' => 'SGS',
    'GT' => 'GTM', 'GU' => 'GUM', 'GW' => 'GNB', 'GY' => 'GUY', 'HK' => 'HKG',
    'HM' => 'HMD', 'HN' => 'HND', 'HR' => 'HRV', 'HT' => 'HTI', 'HU' => 'HUN',
    'ID' => 'IDN', 'IE' => 'IRL', 'IL' => 'ISR', 'IM' => 'IMN', 'IN' => 'IND',
    'IO' => 'IOT', 'IQ' => 'IRQ', 'IR' => 'IRN', 'IS' => 'ISL', 'IT' => 'ITA',
    'JE' => 'JEY', 'JM' => 'JAM', 'JO' => 'JOR', 'JP' => 'JPN', 'KE' => 'KEN',
    'KG' => 'KGZ', 'KH' => 'KHM', 'KI' => 'KIR', 'KM' => 'COM', 'KN' => 'KNA',
    'KP' => 'PRK', 'KR' => 'KOR', 'KW' => 'KWT', 'KY' => 'CYM', 'KZ' => 'KAZ',
    'LA' => 'LAO', 'LB' => 'LBN', 'LC' => 'LCA', 'LI' => 'LIE', 'LK' => 'LKA',
    'LR' => 'LBR', 'LS' => 'LSO', 'LT' => 'LTU', 'LU' => 'LUX', 'LV' => 'LVA',
    'LY' => 'LBY', 'MA' => 'MAR', 'MC' => 'MCO', 'MD' => 'MDA', 'ME' => 'MNE',
    'MF' => 'MAF', 'MG' => 'MDG', 'MH' => 'MHL', 'MK' => 'MKD', 'ML' => 'MLI',
    'MM' => 'MMR', 'MN' => 'MNG', 'MO' => 'MAC', 'MP' => 'MNP', 'MQ' => 'MTQ',
    'MR' => 'MRT', 'MS' => 'MSR', 'MT' => 'MLT', 'MU' => 'MUS', 'MV' => 'MDV',
    'MW' => 'MWI', 'MX' => 'MEX', 'MY' => 'MYS', 'MZ' => 'MOZ', 'NA' => 'NAM',
    'NC' => 'NCL', 'NE' => 'NER', 'NF' => 'NFK', 'NG' => 'NGA', 'NI' => 'NIC',
    'NL' => 'NLD', 'NO' => 'NOR', 'NP' => 'NPL', 'NR' => 'NRU', 'NU' => 'NIU',
    'NZ' => 'NZL', 'OM' => 'OMN', 'PA' => 'PAN', 'PE' => 'PER', 'PF' => 'PYF',
    'PG' => 'PNG', 'PH' => 'PHL', 'PK' => 'PAK', 'PL' => 'POL', 'PM' => 'SPM',
    'PN' => 'PCN', 'PR' => 'PRI', 'PS' => 'PSE', 'PT' => 'PRT', 'PW' => 'PLW',
    'PY' => 'PRY', 'QA' => 'QAT', 'RE' => 'REU', 'RO' => 'ROU', 'RS' => 'SRB',
    'RU' => 'RUS', 'RW' => 'RWA', 'SA' => 'SAU', 'SB' => 'SLB', 'SC' => 'SYC',
    'SD' => 'SDN', 'SE' => 'SWE', 'SG' => 'SGP', 'SH' => 'SHN', 'SI' => 'SVN',
    'SJ' => 'SJM', 'SK' => 'SVK', 'SL' => 'SLE', 'SM' => 'SMR', 'SN' => 'SEN',
    'SO' => 'SOM', 'SR' => 'SUR', 'SS' => 'SSD', 'ST' => 'STP', 'SV' => 'SLV',
    'SX' => 'SXM', 'SY' => 'SYR', 'SZ' => 'SWZ', 'TC' => 'TCA', 'TD' => 'TCD',
    'TF' => 'ATF', 'TG' => 'TGO', 'TH' => 'THA', 'TJ' => 'TJK', 'TK' => 'TKL',
    'TL' => 'TLS', 'TM' => 'TKM', 'TN' => 'TUN', 'TO' => 'TON', 'TR' => 'TUR',
    'TT' => 'TTO', 'TV' => 'TUV', 'TW' => 'TWN', 'TZ' => 'TZA', 'UA' => 'UKR',
    'UG' => 'UGA', 'UM' => 'UMI', 'US' => 'USA', 'UY' => 'URY', 'UZ' => 'UZB',
    'VA' => 'VAT', 'VC' => 'VCT', 'VE' => 'VEN', 'VG' => 'VGB', 'VI' => 'VIR',
    'VN' => 'VNM', 'VU' => 'VUT', 'WF' => 'WLF', 'WS' => 'WSM', 'YE' => 'YEM',
    'YT' => 'MYT', 'ZA' => 'ZAF', 'ZM' => 'ZMB', 'ZW' => 'ZWE'
  }.freeze

  COUNTRY_NAMES = {
    'AD' => 'Andorra', 'AE' => 'United Arab Emirates', 'AF' => 'Afghanistan',
    'AG' => 'Antigua and Barbuda', 'AI' => 'Anguilla', 'AL' => 'Albania',
    'AM' => 'Armenia', 'AO' => 'Angola', 'AQ' => 'Antarctica', 'AR' => 'Argentina',
    'AS' => 'American Samoa', 'AT' => 'Austria', 'AU' => 'Australia', 'AW' => 'Aruba',
    'AX' => 'Åland Islands', 'AZ' => 'Azerbaijan', 'BA' => 'Bosnia and Herzegovina',
    'BB' => 'Barbados', 'BD' => 'Bangladesh', 'BE' => 'Belgium', 'BF' => 'Burkina Faso',
    'BG' => 'Bulgaria', 'BH' => 'Bahrain', 'BI' => 'Burundi', 'BJ' => 'Benin',
    'BL' => 'Saint Barthélemy', 'BM' => 'Bermuda', 'BN' => 'Brunei', 'BO' => 'Bolivia',
    'BQ' => 'Bonaire, Sint Eustatius and Saba', 'BR' => 'Brazil', 'BS' => 'Bahamas',
    'BT' => 'Bhutan', 'BV' => 'Bouvet Island', 'BW' => 'Botswana', 'BY' => 'Belarus',
    'BZ' => 'Belize', 'CA' => 'Canada', 'CC' => 'Cocos (Keeling) Islands',
    'CD' => 'Democratic Republic of the Congo', 'CF' => 'Central African Republic',
    'CG' => 'Republic of the Congo', 'CH' => 'Switzerland', 'CI' => 'Ivory Coast',
    'CK' => 'Cook Islands', 'CL' => 'Chile', 'CM' => 'Cameroon', 'CN' => 'China',
    'CO' => 'Colombia', 'CR' => 'Costa Rica', 'CU' => 'Cuba', 'CV' => 'Cape Verde',
    'CW' => 'Curaçao', 'CX' => 'Christmas Island', 'CY' => 'Cyprus', 'CZ' => 'Czech Republic',
    'DE' => 'Germany', 'DJ' => 'Djibouti', 'DK' => 'Denmark', 'DM' => 'Dominica',
    'DO' => 'Dominican Republic', 'DZ' => 'Algeria', 'EC' => 'Ecuador', 'EE' => 'Estonia',
    'EG' => 'Egypt', 'EH' => 'Western Sahara', 'ER' => 'Eritrea', 'ES' => 'Spain',
    'ET' => 'Ethiopia', 'FI' => 'Finland', 'FJ' => 'Fiji', 'FK' => 'Falkland Islands',
    'FM' => 'Micronesia', 'FO' => 'Faroe Islands', 'FR' => 'France', 'GA' => 'Gabon',
    'GB' => 'United Kingdom', 'GD' => 'Grenada', 'GE' => 'Georgia', 'GF' => 'French Guiana',
    'GG' => 'Guernsey', 'GH' => 'Ghana', 'GI' => 'Gibraltar', 'GL' => 'Greenland',
    'GM' => 'Gambia', 'GN' => 'Guinea', 'GP' => 'Guadeloupe', 'GQ' => 'Equatorial Guinea',
    'GR' => 'Greece', 'GS' => 'South Georgia and the South Sandwich Islands',
    'GT' => 'Guatemala', 'GU' => 'Guam', 'GW' => 'Guinea-Bissau', 'GY' => 'Guyana',
    'HK' => 'Hong Kong', 'HM' => 'Heard Island and McDonald Islands', 'HN' => 'Honduras',
    'HR' => 'Croatia', 'HT' => 'Haiti', 'HU' => 'Hungary', 'ID' => 'Indonesia',
    'IE' => 'Ireland', 'IL' => 'Israel', 'IM' => 'Isle of Man', 'IN' => 'India',
    'IO' => 'British Indian Ocean Territory', 'IQ' => 'Iraq', 'IR' => 'Iran',
    'IS' => 'Iceland', 'IT' => 'Italy', 'JE' => 'Jersey', 'JM' => 'Jamaica',
    'JO' => 'Jordan', 'JP' => 'Japan', 'KE' => 'Kenya', 'KG' => 'Kyrgyzstan',
    'KH' => 'Cambodia', 'KI' => 'Kiribati', 'KM' => 'Comoros', 'KN' => 'Saint Kitts and Nevis',
    'KP' => 'North Korea', 'KR' => 'South Korea', 'KW' => 'Kuwait', 'KY' => 'Cayman Islands',
    'KZ' => 'Kazakhstan', 'LA' => 'Laos', 'LB' => 'Lebanon', 'LC' => 'Saint Lucia',
    'LI' => 'Liechtenstein', 'LK' => 'Sri Lanka', 'LR' => 'Liberia', 'LS' => 'Lesotho',
    'LT' => 'Lithuania', 'LU' => 'Luxembourg', 'LV' => 'Latvia', 'LY' => 'Libya',
    'MA' => 'Morocco', 'MC' => 'Monaco', 'MD' => 'Moldova', 'ME' => 'Montenegro',
    'MF' => 'Saint Martin', 'MG' => 'Madagascar', 'MH' => 'Marshall Islands',
    'MK' => 'North Macedonia', 'ML' => 'Mali', 'MM' => 'Myanmar', 'MN' => 'Mongolia',
    'MO' => 'Macau', 'MP' => 'Northern Mariana Islands', 'MQ' => 'Martinique',
    'MR' => 'Mauritania', 'MS' => 'Montserrat', 'MT' => 'Malta', 'MU' => 'Mauritius',
    'MV' => 'Maldives', 'MW' => 'Malawi', 'MX' => 'Mexico', 'MY' => 'Malaysia',
    'MZ' => 'Mozambique', 'NA' => 'Namibia', 'NC' => 'New Caledonia', 'NE' => 'Niger',
    'NF' => 'Norfolk Island', 'NG' => 'Nigeria', 'NI' => 'Nicaragua', 'NL' => 'Netherlands',
    'NO' => 'Norway', 'NP' => 'Nepal', 'NR' => 'Nauru', 'NU' => 'Niue', 'NZ' => 'New Zealand',
    'OM' => 'Oman', 'PA' => 'Panama', 'PE' => 'Peru', 'PF' => 'French Polynesia',
    'PG' => 'Papua New Guinea', 'PH' => 'Philippines', 'PK' => 'Pakistan', 'PL' => 'Poland',
    'PM' => 'Saint Pierre and Miquelon', 'PN' => 'Pitcairn', 'PR' => 'Puerto Rico',
    'PS' => 'Palestine', 'PT' => 'Portugal', 'PW' => 'Palau', 'PY' => 'Paraguay',
    'QA' => 'Qatar', 'RE' => 'Réunion', 'RO' => 'Romania', 'RS' => 'Serbia', 'RU' => 'Russia',
    'RW' => 'Rwanda', 'SA' => 'Saudi Arabia', 'SB' => 'Solomon Islands', 'SC' => 'Seychelles',
    'SD' => 'Sudan', 'SE' => 'Sweden', 'SG' => 'Singapore', 'SH' => 'Saint Helena',
    'SI' => 'Slovenia', 'SJ' => 'Svalbard and Jan Mayen', 'SK' => 'Slovakia',
    'SL' => 'Sierra Leone', 'SM' => 'San Marino', 'SN' => 'Senegal', 'SO' => 'Somalia',
    'SR' => 'Suriname', 'SS' => 'South Sudan', 'ST' => 'São Tomé and Príncipe',
    'SV' => 'El Salvador', 'SX' => 'Sint Maarten', 'SY' => 'Syria', 'SZ' => 'Eswatini',
    'TC' => 'Turks and Caicos Islands', 'TD' => 'Chad', 'TF' => 'French Southern Territories',
    'TG' => 'Togo', 'TH' => 'Thailand', 'TJ' => 'Tajikistan', 'TK' => 'Tokelau',
    'TL' => 'Timor-Leste', 'TM' => 'Turkmenistan', 'TN' => 'Tunisia', 'TO' => 'Tonga',
    'TR' => 'Turkey', 'TT' => 'Trinidad and Tobago', 'TV' => 'Tuvalu', 'TW' => 'Taiwan',
    'TZ' => 'Tanzania', 'UA' => 'Ukraine', 'UG' => 'Uganda',
    'UM' => 'United States Minor Outlying Islands', 'US' => 'United States', 'UY' => 'Uruguay',
    'UZ' => 'Uzbekistan', 'VA' => 'Vatican City', 'VC' => 'Saint Vincent and the Grenadines',
    'VE' => 'Venezuela', 'VG' => 'British Virgin Islands', 'VI' => 'U.S. Virgin Islands',
    'VN' => 'Vietnam', 'VU' => 'Vanuatu', 'WF' => 'Wallis and Futuna', 'WS' => 'Samoa',
    'YE' => 'Yemen', 'YT' => 'Mayotte', 'ZA' => 'South Africa', 'ZM' => 'Zambia',
    'ZW' => 'Zimbabwe'
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

    { iso2: iso2, iso3: iso3, name: name.presence || 'Unknown' }
  end

  def self.merge_stats(raw_stats)
    merged = raw_stats.each_with_object({}) do |row, h|
      c = resolve_country(row['country'])
      key = c[:iso2] && ISO2_TO_ISO3.key?(c[:iso2]) ? c[:iso2] : 'Unknown'

      h[key] ||= {
        iso2: key == 'Unknown' ? nil : c[:iso2],
        iso3: key == 'Unknown' ? nil : c[:iso3],
        name: key == 'Unknown' ? 'Unknown' : c[:name],
        unique_visits: 0,
        unique_users: 0,
        events_count: 0,
        deployments_count: 0,
        visit_podcast_count: 0,
        first_event: nil,
        last_event: nil
      }

      h[key][:unique_visits] += row['unique_visits'] || 0
      h[key][:unique_users] += row['unique_users'] || 0
      h[key][:events_count] += row['events_count'] || 0
      h[key][:deployments_count] += row['deployments_count'] || 0
      h[key][:visit_podcast_count] += row['visit_podcast_count'] || 0
      h[key][:first_event] ||= row['first_event']
      h[key][:last_event] = [h[key][:last_event], row['last_event']].compact.max
    end

    merged.values
  end

  def self.calculate_bins(values, bin_count = 5)
    return [] if values.empty?
    return [{ bin: 0, min: 0, max: values.first, label: "#{values.first}" }] if bin_count == 1

    sorted = values.sort.uniq
    min_val = sorted.first
    max_val = sorted.last

    # For small datasets, use the actual values as boundaries
    if bin_count <= sorted.length
      # Calculate bin boundaries based on percentiles
      bin_boundaries = (0...bin_count).map do |bin_idx|
        percentile = (bin_idx * 100.0 / (bin_count - 1)).round
        case bin_idx
        when 0
          min_val
        when bin_count - 1
          max_val
        else
          idx = ((percentile / 100.0) * (sorted.length - 1)).round
          sorted[idx]
        end
      end.uniq

      # Create bins with min/max ranges
      bin_boundaries.each_with_index.map do |boundary, bin_idx|
        min_range = bin_idx.zero? ? 0 : bin_boundaries[bin_idx - 1]
        max_range = boundary
        {
          bin: bin_idx,
          min: min_range,
          max: max_range,
          label: bin_idx == bin_boundaries.length - 1 ? "#{min_range}+" : "#{min_range}-#{max_range}"
        }
      end
    else
      # Shouldn't happen with our new logic, but safety fallback
      [{ bin: 0, min: 0, max: max_val, label: "0-#{max_val}" }]
    end
  end

  def self.get_bin(value, bins)
    return 0 if value.zero?

    bins.each { |b| return b[:bin] if value >= b[:min] && value <= b[:max] }
    bins.last[:bin] # If above max, put in last bin
  end

  def self.format_country_stats(raw_stats, include_stats: true, include_bins: true)
    merged_stats = merge_stats(raw_stats)

    # Get unique visit counts for bin calculation (need unique values only)
    unique_visit_counts = merged_stats.map { |r| r[:unique_visits] || 0 }.sort.uniq

    # Use fewer bins when there aren't enough unique values
    # Max 5 bins, but use min(5, number of unique values)
    max_bins = 5
    bin_count = [unique_visit_counts.length, max_bins].min
    bin_count = 1 if bin_count < 1 # Safety check
    bin_count = 0 unless include_bins

    bins = include_bins ? calculate_bins(unique_visit_counts, bin_count) : []

    formatted = if include_stats
      merged_stats.map do |row|
        next_row = row.dup
        if include_bins
          visits = row[:unique_visits] || 0
          next_row[:bin] = get_bin(visits, bins)
        end
        next_row
      end
    else
      []
    end

    # Separate known countries from unknown for accurate counts
    known_countries = merged_stats.reject { |s| s[:iso2].nil? }

    {
      stats: formatted.sort_by { |s| -s[:unique_visits] },
      bins: bins,
      bin_count: bin_count,
      total_visits: merged_stats.sum { |s| s[:unique_visits] || 0 },
      country_count: known_countries.size,
      total_deployments: merged_stats.map { |s| s[:deployments_count] || 0 }.max || 0,
      total_podcast_listens: merged_stats.sum { |s| s[:visit_podcast_count] || 0 }
    }
  end
end
