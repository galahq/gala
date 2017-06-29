# frozen_string_literal: true

class CreditsList
  class Guest
    include Virtus.model

    attribute :name, String
    attribute :title, String
  end

  include Virtus.model

  attribute :hosts, Array[String]
  attribute :guests, Array[Guest]

  def to_sentence
    x = attributes
    x['hosts_string'] = hosts.to_sentence
    x
  end
end
