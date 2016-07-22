module CasesHelper
  def title_for_catalog c
    return c.short_title if c.featured? && !c.short_title.blank?
    c.title
  end

  def translators_string c
    number = c.translators.count == 1 ? 'one' : 'many'
    "#{t ".translator.#{number}"}: #{c.translators.to_sentence}"
  end
end
