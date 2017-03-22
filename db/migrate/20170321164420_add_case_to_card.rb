class AddCaseToCard < ActiveRecord::Migration[5.0]
  def change
    add_reference :cards, :case, foreign_key: true

    reversible do |dir|
      dir.up do
        Card.where.not(element_id: nil).each do |card|
          card.update_columns case_id: card.element.case_id
        end
      end
      dir.down do

      end
    end
  end
end
