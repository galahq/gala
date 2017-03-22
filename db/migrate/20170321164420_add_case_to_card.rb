class AddCaseToCard < ActiveRecord::Migration[5.0]
  def change
    add_reference :cards, :case, foreign_key: true

    reversible do |dir|
      dir.up do
        Card.where.not(element_id: nil).each do |card|
          card.update case: card.element.case
        end
      end
      dir.down do

      end
    end
  end
end
