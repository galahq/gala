# frozen_string_literal: true

class Activity < ActiveRecord::Base
  has_one :case_element, as: :element, dependent: :destroy
  has_one :card, as: :element, dependent: :destroy

  def case
    case_element.case
  end
end

class ConvertActivitiesToPages < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        Activity.all.each do |old_activity|
          creator = create_activity old_activity
          add_instructions_to_card old_activity.card, creator.card
          add_details_to_edgenote old_activity, creator.edgenote
        end

        update_materialized_view
      end
    end

    drop_table :activities do |t|
      t.text :title
      t.text :pdf_url
      t.text :icon_slug
      t.integer :position
      t.references :case, foreign_key: true
    end
  end

  private

  def create_activity(old_activity)
    creator = ActivityCreator.for(old_activity.case)
    creator.page.case_element.delete # No callbacks, which would delete page
    old_activity.case_element.update element: creator.page
    creator.page.update title: old_activity.title
    creator
  end

  def add_instructions_to_card(old_card, new_card)
    new_card.raw_content.blocks.concat old_card.raw_content.blocks
    new_card.raw_content.entity_map.merge! old_card.raw_content.entity_map
    new_card.save
  end

  def add_details_to_edgenote(old_activity, new_edgenote)
    new_edgenote.website_url = old_activity.pdf_url
    new_edgenote.caption = 'Access the necessary materials here.'
    new_edgenote.save
  end

  def update_materialized_view
    execute <<~SQL
      DROP INDEX index_cases_on_full_text;
      DROP INDEX index_cases_search_index;
      DROP MATERIALIZED VIEW cases_search_index;
    SQL

    execute <<~SQL
      CREATE MATERIALIZED VIEW cases_search_index AS
      SELECT cases.id AS id,
             setweight(to_tsvector(coalesce(cases.kicker, '')), 'A')
               || setweight(to_tsvector(coalesce(cases.title, '')), 'A')
               || setweight(to_tsvector(coalesce(cases.dek, '')), 'A')
               || setweight(to_tsvector(coalesce(cases.summary, '')), 'A')
               || setweight(
                    jsonb_path_to_tsvector(
                      CASE WHEN jsonb_typeof(learning_objectives) <> 'array'
                           THEN '[]'::jsonb
                           ELSE learning_objectives
                       END,
                      '{}'
                    ),
                    'B'
                  )
               || jsonb_path_to_tsvector(cases.authors, '{name}')
               || setweight(
                    to_tsvector(coalesce(string_agg(pages.title, ' '), '')),
                    'B'
                  )
               || setweight(
                    to_tsvector(coalesce(string_agg(podcasts.title, ' '), '')),
                    'B'
                  )
               || to_tsvector(coalesce(string_agg(podcasts.credits, ' '), ''))
               || coalesce(
                    tsvector_agg(
                      jsonb_path_to_tsvector(
                        cards.raw_content->'blocks',
                        '{text}'
                      )
                    ),
                    to_tsvector('')
                  )
             AS document
        FROM cases
        LEFT JOIN pages ON pages.case_id = cases.id
        LEFT JOIN podcasts ON podcasts.case_id = cases.id
        LEFT JOIN cards ON cards.case_id = cases.id
          GROUP BY cases.id;

      CREATE UNIQUE INDEX index_cases_search_index ON cases_search_index
             USING btree(id);

      CREATE INDEX index_cases_on_full_text ON cases_search_index
             USING gin(document);
    SQL
  end
end
