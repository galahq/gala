# frozen_string_literal: true

class ConvertRawContentToJson < ActiveRecord::Migration[5.0]
  def change
    reversible do |dir|
      dir.up do
        Card.find_each do |card|
          raw_content = card.read_attribute(:raw_content)
                            .each_with_object({}) do |(key, value), hash|
            hash[key] = JSON.parse value
          end
          card.write_attribute :raw_content, raw_content
          card.save
        end
      end

      dir.down do
        Card.find_each do |card|
          raw_content = card.read_attribute(:raw_content)
                            .each_with_object({}) do |(key, value), hash|
            hash[key] = JSON.dump value
          end
          card.write_attribute :raw_content, raw_content
          card.save
        end
      end
    end
  end
end
