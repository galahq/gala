# frozen_string_literal: true

Rails.application.configure do
  config.i18n.load_path +=
    Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]

  available_locales = Dir[Rails.root.join('config', 'locales', '*.{yml}')]
                      .map { |fname| File.basename fname, '.yml' }
                      .map(&:to_sym)
  config.i18n.available_locales = ([:en] + available_locales).uniq

  config.i18n.fallbacks = %i[en]
end

module Translation
  AVAILABLE_LANGUAGES = {
    en: 'English',
    'zh-CN': '中文（简体）',
    'zh-TW': '中文（繁體）',
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
    ur: 'اُردُو‬',
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
    su: 'ᮘᮞ ᮞᮥᮔ᮪ᮓ',
    or: 'ଓଡ଼ିଆ',
    my: 'မြန်မာစာ',
    uk: 'українська мова',
    bho: 'भोजपुरी',
    tl: 'Wikang Tagalog',
    yo: 'Èdè Yorùbá',
    mai: 'मैथिली',
    ml: 'മലയാളം',
    uz: 'oʻzbekcha',
    sd: 'سنڌي',
    am: 'አማርኛ',
    ff: 'Fulfulde',
    ro: 'Limba Română',
    om: 'Afaan Oromoo',
    ig: 'Asụsụ Igbo',
    az: 'Azərbaycan dili',
    awa: 'अवधी',
    ceb: 'Sugboanon',
    nl: 'Nederlands',
    ku: 'Kurdî',
    scr: 'Srpskohrvatski',
    scc: 'Српскохрватски',
    mg: 'Malagasy',
    ne: 'नेपाली',
    si: 'සිංහල',
    ctg: 'চাঁটগাঁইয়া',
    km: 'ភាសាខ្មែរ',
    tk: 'Türkmençe',
    as: 'অসমীয়া',
    mad: 'Madhura',
    so: 'af Soomaali',
    mwr: 'मारवाड़ी',
    mag: 'मगही',
    bgc: 'हरयाणवी',
    hu: 'Magyar Nyelv',
    hne: 'छत्तिसगढी़',
    el: 'Ελληνικά',
    ny: 'Chichewa',
    dcc: 'دکنی',
    ak: 'Akan',
    kk: 'Қазақ тілі',
    syl: 'ꠍꠤꠟꠐꠤ',
    zu: 'isiZulu',
    cs: 'Čeština',
    rw: 'Kinyarwanda',
    ht: 'Kreyòl Ayisyen',
    sv: 'Svenska',
    xh: 'isiXhosa',
    he: 'עברית'
  }.with_indifferent_access.freeze

  def self.languages
    AVAILABLE_LANGUAGES.keys
  end

  def self.language_name(code)
    AVAILABLE_LANGUAGES[code] || code
  end
end
