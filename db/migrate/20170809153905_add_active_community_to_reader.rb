# frozen_string_literal: true

class AddActiveCommunityToReader < ActiveRecord::Migration[5.0]
  def change
    add_reference :readers, :active_community,
                  foreign_key: { to_table: :communities }
  end
end
