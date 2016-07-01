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
    x = self.attributes
    x["hosts_string"] = hosts.to_sentence
    x
  end
end
