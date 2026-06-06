# frozen_string_literal: true

require 'cgi'

module GalaMarkdown
  module_function

  def render(markdown)
    lines = markdown.to_s.gsub("\r\n", "\n").gsub("\r", "\n").split("\n")
    blocks = []
    index = 0

    while index < lines.length
      line = lines[index]

      if line.strip.empty?
        index += 1
      elsif (heading = line.match(/\A(#+)\s+(.+)\z/)) && heading[1].length <= 6
        level = heading[1].length
        blocks << tag("h#{level}", inline(heading[2]))
        index += 1
      elsif line.match?(/\A\s*[-*]\s+/)
        items, index = collect_list(lines, index, /\A\s*[-*]\s+(.+)\z/)
        blocks << tag('ul', items.map { |item| tag('li', inline(item)) }.join)
      elsif line.match?(/\A\s*\d+\.\s+/)
        items, index = collect_list(lines, index, /\A\s*\d+\.\s+(.+)\z/)
        blocks << tag('ol', items.map { |item| tag('li', inline(item)) }.join)
      elsif line.start_with?('>')
        quotes, index = collect_prefixed(lines, index, '>')
        blocks << tag('blockquote', render(quotes.join("\n")))
      else
        paragraph, index = collect_paragraph(lines, index)
        blocks << tag('p', inline(paragraph.join("\n")))
      end
    end

    blocks.join("\n")
  end

  def collect_list(lines, index, pattern)
    items = []

    while index < lines.length && (match = lines[index].match(pattern))
      items << match[1]
      index += 1
    end

    [items, index]
  end

  def collect_prefixed(lines, index, prefix)
    items = []

    while index < lines.length && lines[index].start_with?(prefix)
      items << lines[index].delete_prefix(prefix).strip
      index += 1
    end

    [items, index]
  end

  def collect_paragraph(lines, index)
    paragraph = []

    while index < lines.length
      line = lines[index]
      break if line.strip.empty?
      break if line.match?(/\A#+\s+/)
      break if line.match?(/\A\s*[-*]\s+/)
      break if line.match?(/\A\s*\d+\.\s+/)
      break if line.start_with?('>')

      paragraph << line
      index += 1
    end

    [paragraph, index]
  end

  def inline(text)
    text = preserve_inline_html(text.to_s)
    text = text.gsub(/\[([^\]]+)\]\(([^)\s]+)\)/) do
      href = CGI.escapeHTML(::Regexp.last_match(2))
      %(<a href="#{href}">#{inline(::Regexp.last_match(1))}</a>)
    end
    text = text.gsub(/\*\*([^*]+)\*\*/, '<strong>\1</strong>')
    text = text.gsub(/__([^_]+)__/, '<strong>\1</strong>')
    text = text.gsub(/\*([^*]+)\*/, '<em>\1</em>')
    text = text.gsub(/_([^_]+)_/, '<em>\1</em>')
    text.gsub("\n", '<br>')
  end

  def preserve_inline_html(text)
    text
  end

  def tag(name, content)
    "<#{name}>#{content}</#{name}>"
  end
end
