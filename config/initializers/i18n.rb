# frozen_string_literal: true

Rails.application.configure do
  config.i18n.load_path +=
    Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]

  available_locales = Dir[Rails.root.join('config', 'locales', '*.{yml}')]
                      .map { |fname| File.basename fname, '.yml' }
                      .map(&:to_sym)
  config.i18n.available_locales = ([:en] + available_locales).uniq
end

module Translation
  AVAILABLE_LANGUAGES = {
    en: 'English',
    'zh-CN': '中文（简体）',
    'zh-TW': '中文（繁体）',
    hi: 'हिन्दी',
    es: 'Español',
    ar: 'العَرَبِيَّة‎',
    fr: 'Français',
    id: 'Bahasa Indonesia',
    ru: 'Русский',
    bn: 'বাংলা',
    pt: 'Português',
    pa: 'ਪੰਜਾਬੀ',
    de: 'Deutsch',
    ja: '日本語',
    fa: 'فارسی',
    sw: 'Kiswahili',
    jv: 'Basa Jawa',
    te: 'తెలుగు',
    ur: 'Urdu',
    tr: 'Türkçe',
    ko: '한국어',
    mr: 'मराठी',
    ta: 'தமிழ்',
    vi: 'Tiếng Việt',
    it: 'Italiano',
    ha: 'هَوُسَ',
    th: 'ไทย',
    gu: 'ગુજરાતી',
    pl: 'Polski',
    kn: 'ಕನ್ನಡ',
    am: 'አማርኛ',
    nl: 'Nederlands',
    ne: 'नेपाली',
    el: 'Ελληνικά',
    xh: 'isiXhosa'
  }.with_indifferent_access.freeze

  def self.languages
    AVAILABLE_LANGUAGES.keys
  end

  def self.language_name(code)
    AVAILABLE_LANGUAGES[code] || code
  end
end
