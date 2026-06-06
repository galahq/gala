# frozen_string_literal: true

class CreditsList
  class Guest
    attr_accessor :name, :title

    def initialize(attributes = {})
      attributes ||= {}
      @name = attributes[:name] || attributes['name']
      @title = attributes[:title] || attributes['title']
    end

    def attributes
      {
        'name' => name,
        'title' => title
      }
    end
  end

  attr_accessor :hosts, :guests

  def initialize(attributes = {})
    attributes ||= {}
    @hosts = Array(attributes[:hosts] || attributes['hosts'])
    @guests = Array(attributes[:guests] || attributes['guests']).map do |guest|
      guest.is_a?(Guest) ? guest : Guest.new(guest)
    end
  end

  def attributes
    {
      'hosts' => hosts,
      'guests' => guests.map(&:attributes)
    }
  end

  def to_sentence
    x = attributes
    x['hosts_string'] = hosts.to_sentence
    x
  end
end
