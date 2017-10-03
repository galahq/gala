# frozen_string_literal: true

module CasesHelper
  def translators_string(c)
    return '' if c.translators.empty?
    number = c.translators.count == 1 ? 'one' : 'many'
    "#{t ".translator.#{number}"}: #{c.translators.to_sentence}"
  end

  def ix_cover_image(c, size)
    return '' unless c.cover_url
    opts = %w[fit=crop crop=faces,entropy]
    opts += case size
            when :small
              %w[w=200 h=200]
            when :square
              %w[w=600 h=600]
            when :featured
              %w[w=1100 h=600]
            when :billboard
              %w[w=1280 h=540]
            when :email
              %w[w=470 h=95]
            when :open_graph
              %w[w=1200 h=675]
            end || []
    has_query = c.cover_url.include? '?'
    "#{c.cover_url}#{has_query ? '&' : '?'}#{opts.join '&'}"
  end

  def cases_as_json(cases)
    array = cases.map { |c| raw render partial: 'cases/case', formats: [:json], locals: { c: c } }
  end
end
