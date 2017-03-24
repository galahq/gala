class AddCardToPodcastAndActivity < ActiveRecord::Migration[5.0]
  def change
    add_reference :cards, :element, polymorphic: true

    reversible do |dir|
      dir.up do
        Card.where.not(page_id: nil).each do |card|
          card.update_columns element_id: card.page_id, element_type: "Page"
        end
        Podcast.all.each do |podcast|
          podcast.create_card content_i18n: podcast.description_i18n
        end
        Activity.all.each do |activity|
          activity.create_card content_i18n: activity.description_i18n
        end
      end

      dir.down do
      end
    end
  end
end
