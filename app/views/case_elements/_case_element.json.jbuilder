json.key_format! camelize: :lower
json.(case_element, :id, :case_id, :element_id, :element_type, :position)
json.elementStore "#{case_element.element_type.tableize}ById"
