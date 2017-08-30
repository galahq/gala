# frozen_string_literal: true

# A functional, composable way of filtering parameters.
# http://blog.martinosis.com/blog/simple-functional-strong-params-in-ruby/

class Sv
  mattr_accessor :hash_of, :struct_of, :map_of, :array_of, :one_of, :scalar,
                 :anything, :default

  # Filters out any unknown keys or known keys of the wrong type
  def self.hash_of(fields)
    ->(hash) {
      hash ||= {}
      fields.map { |key, fn| [key, fn.call(hash[key])] }.to_h.compact
    }
  end

  # All or nothing hash_of; nullifies the object if it doesn’t have all the
  # right keys with all the right types of values
  def self.struct_of(fields)
    ->(hash) {
      clean_hash = Sv.hash_of(fields).(hash)
      (fields.keys - clean_hash.keys).empty? ? clean_hash : nil
    }
  end

  # Accepts any key except those with values of the wrong type
  def self.map_of(fn)
    ->(hash) {
      hash ||= {}
      hash = hash.permit!.to_h if hash.is_a? ActionController::Parameters

      hash.map do |key, value|
        filtered_value = fn.call(value)
        filtered_value.blank? ? nil : [key, fn.call(value)]
      end.compact.to_h
    }
  end

  # Filters out elements of the wrong type
  def self.array_of(fn)
    ->(value) {
      value.is_a?(Array) ? value.map(&fn).compact : []
    }
  end

  # Provides a default
  def self.default(default)
    ->(a) { a.blank? ? default : a }.curry
  end

  # Filters out any values not present in the provided array
  def self.one_of(options)
    ->(a) { options.include?(a) ? a : nil }.curry
  end

  # Accepts any scalar value
  def self.scalar
    ->(a) { a.is_a?(Array) || a.is_a?(Hash) ? nil : a }
  end

  # Accepts any data structure
  def self.anything
    :itself.to_proc
  end
end
