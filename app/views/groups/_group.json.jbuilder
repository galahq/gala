json.(group, *%i(id name))
json.readers do
  json.array! group.readers, partial: 'readers/reader', as: :reader
end
