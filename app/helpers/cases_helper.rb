module CasesHelper
  def translators_string c
    return ""  if c.translator_names.empty?
    number = c.translator_names.count == 1 ? 'one' : 'many'
    "#{t ".translator.#{number}"}: #{c.translator_names.to_sentence}"
  end
end
