# frozen_string_literal: true

class CreateLinkExpansionVisibilities < ActiveRecord::Migration[5.2]
  def change
    create_table :link_expansion_visibilities do |t|
      t.boolean :no_description, default: false
      t.boolean :no_embed, default: false
      t.boolean :no_image, default: false

      t.references :edgenote
    end
  end
end
