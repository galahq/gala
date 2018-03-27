# frozen_string_literal: true

class LinkExpansion
  # Null Object
  class DefaultVisibility
    include Singleton

    %i[no_description no_embed no_image].each do |method|
      define_method(method) { false }
    end
  end
end
