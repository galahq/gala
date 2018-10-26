# frozen_string_literal: true

# Find {Reader}s based on name and role
class FindReaders
  # @param name [String, nil]
  # @param role [String, nil]
  # @return [ActiveRecord::Relation<Reader>]
  def self.by(name: nil, role: nil)
    new(name, role).call
  end

  def initialize(name, role)
    @name = name
    @role = role
  end

  def call
    Reader.all
          .merge(maybe_filter_by_name)
          .merge(maybe_filter_by_role)
  end

  private

  def maybe_filter_by_name
    return Reader.all if @name.blank?
    Reader.where 'readers.name ILIKE ?', "%#{@name}%"
  end

  def maybe_filter_by_role
    return Reader.all if @role.blank?
    Reader.with_role(*@role)
  end
end
