# frozen_string_literal: true

class CreateLibraries < ActiveRecord::Migration[5.1]
  def change
    create_table :libraries do |t|
      t.string :slug
      t.string :name
      t.string :logo_url
      t.string :background_color
      t.string :foreground_color

      t.timestamps
    end
    add_index :libraries, :slug, unique: true

    add_reference :cases, :library

    reversible do |dir|
      dir.up do
        msc = Library.create slug: 'michigan-sustainaility-cases',
                             name: 'Michigan Sustainability Cases',
                             logo_url: 'https://msc-gala.imgix.net/block-m.svg',
                             background_color: '#00274c',
                             foreground_color: '#ffcb05'
        Case.where(library: nil).update_all library_id: msc.id
      end
    end
  end
end
