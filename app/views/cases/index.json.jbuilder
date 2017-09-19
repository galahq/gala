# frozen_string_literal: true

json.key_format! camelize: :lower

@cases.each do |kase|
  json.set! kase.slug do
    json.partial! kase, locals: { c: kase }
  end
end
