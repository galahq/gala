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

  def duration(cases)
    if cases.present?
      time = cases.select("properties->>'duration' as duration")&.map{|r|r.duration.to_i}&.map{|d|d/60}&.then { |a| a.sum.to_f / a.size }.round
      "#{time} seconds"
    else
      "NA"
    end

  end
end
