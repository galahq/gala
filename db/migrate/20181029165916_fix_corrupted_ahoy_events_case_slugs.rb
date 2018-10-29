# frozen_string_literal: true

class FixCorruptedAhoyEventsCaseSlugs < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        execute <<~SQL
          UPDATE ahoy_events
             SET properties = properties - 'caseSlug'
                   || jsonb_build_object('case_slug', properties -> 'caseSlug')
           WHERE properties ? 'caseSlug'
          ;
        SQL
      end
    end
  end

  def normalize_property_case(property)
    camel = property.camelize
    snake = property.underscore

    execute <<~SQL
      UPDATE ahoy_events
         SET properties = properties - '#{camel}'
               || jsonb_build_object('#{snake}', properties -> '#{camel}')
       WHERE properties ? '#{camel}'
      ;
    SQL
  end
end
