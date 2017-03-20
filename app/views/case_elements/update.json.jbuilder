json.key_format! camelize: :lower
json.array! @case_elements do |case_element|
  json.partial! case_element
end
