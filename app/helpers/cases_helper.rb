# frozen_string_literal: true

# @see Case
module CasesHelper
  def translators_string(c)
    return '' if c.translators.empty?
    number = c.translators.count == 1 ? 'one' : 'many'
    "#{t ".translator.#{number}"}: #{c.translators.to_sentence}"
  end

  def cases_as_json(cases)
    array = cases.map { |c| raw render partial: 'cases/case', formats: [:json], locals: { c: c } }
  end

  def locales_to_sentence(locales = [])
    if locales.present?
      locales.map{|locale| 
      tr = Translation.language_name(locale)
      if tr
        "#{tr} (#{locale})"
      else
        ""
      end
    }&.compact&.to_sentence
    else
      ""
    end

  end
end
