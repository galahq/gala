# frozen_string_literal: true

# A functional, composable way of filtering parameters.
# http://blog.martinosis.com/blog/simple-functional-strong-params-in-ruby/

class Sv
  mattr_accessor :hash_of, :struct_of, :map_of, :array_of, :one_of, :scalar,
                 :anything, :default

  # Filters out any unknown keys or known keys of the wrong type
  @@hash_of = ->(fields, hash) {
    hash ||= {}
    fields.map { |key, fn| [key, fn.call(hash[key])] }.to_h.compact
  }.curry

  # All or nothing hash_of; nullifies the object if it doesn’t have all the
  # right keys with all the right types of values
  @@struct_of = ->(fields, hash) {
    clean_hash = @@hash_of.(fields, hash)
    (fields.keys - clean_hash.keys).empty? ? clean_hash : nil
  }.curry

  # Accepts any key except those with values of the wrong type
  @@map_of = ->(fn, hash) {
    hash ||= {}
    hash = hash.permit!.to_h if hash.is_a? ActionController::Parameters

    hash.map do |key, value|
      filtered_value = fn.call(value)
      filtered_value.blank? ? nil : [key, fn.call(value)]
    end.compact.to_h
  }.curry

  # Filters out elements of the wrong type
  @@array_of = ->(fn, value) {
    value.is_a?(Array) ? value.map(&fn).compact : []
  }.curry

  # Provides a default
  @@default = ->(default, a) { a.blank? ? default : a }.curry

  # Filters out any values not present in the provided array
  @@one_of = ->(options, a) { options.include?(a) ? a : nil }.curry

  # Accepts any scalar value
  @@scalar = ->(a) { a.is_a?(Array) || a.is_a?(Hash) ? nil : a }

  # Accepts any data structure
  @@anything = :itself.to_proc
end
