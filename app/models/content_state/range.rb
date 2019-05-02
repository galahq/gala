# frozen_string_literal: true

class ContentState
  Range = Struct.new(:block_index, :start, :length) do
    include Comparable

    def <=>(other)
      [block_index, start] <=> [other.block_index, other.start]
    end
  end
end
