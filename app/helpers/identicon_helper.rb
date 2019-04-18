# frozen_string_literal: true

module IdenticonHelper
  def identicon(reader)
    data = {
      'controller' => 'identicon',
      'identicon-reader' => reader_props(reader)
    }

    content_tag :div, '', data: data
  end

  private

  def reader_props(reader)
    ActiveModel::Serializer.for reader, serializer: Readers::IdenticonSerializer
  end
end
