module CasesHelper
  def translators_string c
    return ""  if c.translator_names.empty?
    number = c.translator_names.count == 1 ? 'one' : 'many'
    "#{t ".translator.#{number}"}: #{c.translator_names.to_sentence}"
  end

  def ix_cover_image(c, size)
    opts = %w(fit=crop crop=faces,entropy)
    opts += case size
           when :square
             %w(w=600 h=600)
           when :featured
             %w(w=1100 h=600)
           when :billboard
             %w(w=1280 h=540)
           end || []
    return "#{c.cover_url}?#{opts.join '&'}"
  end
end
