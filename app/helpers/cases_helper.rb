module CasesHelper
  def title_for_catalog c
    return c.short_title if c.featured? && !c.short_title.blank?
    c.title
  end

  def translators_string c
    return ""  if c.translator_names.empty?
    number = c.translator_names.count == 1 ? 'one' : 'many'
    "#{t ".translator.#{number}"}: #{c.translator_names.to_sentence}"
  end
end
