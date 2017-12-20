# frozen_string_literal: true

require_relative '20171031161433_create_english_cases_search_index'

class ConvertCaseAuthorsToJsonb < ActiveRecord::Migration[5.1]
  def change
    add_column :cases, :authors_jsonb, :jsonb, default: ''

    reversible do |dir|
      dir.up do
        revert CreateEnglishCasesSearchIndex
        Case.find_each do |c|
          c.update(
            authors_jsonb: {
              "en": c.authors.map { |name| { name: name, institution: '' } }
            }
          )
        end
        update_materialized_view
      end
      dir.down do
        drop_materialized_view
        Case.find_each do |c|
          c.update authors: c.authors_jsonb['en'].map { |author| author['name'] }
        end
        run CreateEnglishCasesSearchIndex
      end
    end

    rename_column :cases, :authors, :authors_array
    rename_column :cases, :authors_jsonb, :authors
    remove_column :cases, :authors_array, :string, array: true, default: []
  end

  private

  def update_materialized_view
    execute <<~SQL
      CREATE MATERIALIZED VIEW cases_search_index_en AS
      SELECT cases.id AS id,
             setweight(to_tsvector(coalesce(cases.kicker->>'en', '')), 'A')
               || setweight(to_tsvector(coalesce(cases.title->>'en', '')), 'A')
               || setweight(to_tsvector(coalesce(cases.dek->>'en', '')), 'A')
               || setweight(
                    to_tsvector(coalesce(cases.summary->>'en', '')),
                    'A'
                  )
               || setweight(
                    to_tsvector(
                      coalesce(cases.learning_objectives->>'en', '' )
                    ),
                    'B'
                  )
               || to_tsvector(coalesce(cases.authors_jsonb->>'en', ''))
               || setweight(
                    to_tsvector(
                      coalesce(string_agg(pages.title->>'en', ' '), '')
                    ),
                    'B'
                  )
               || setweight(
                    to_tsvector(
                      coalesce(string_agg(podcasts.title->>'en', ' '), '')
                    ),
                    'B'
                  )
               || setweight(
                    to_tsvector(
                      coalesce(string_agg(activities.title->>'en', ' '), '')
                    ),
                    'B'
                  )
               || to_tsvector(
                    coalesce(string_agg(podcasts.credits->>'en', ' '), '')
                  )
               || to_tsvector(
                    coalesce(
                      string_agg(cards.raw_content->'en'->>'blocks', ' '),
                      ''
                    )
                  )
             AS document
        FROM cases
        LEFT JOIN pages ON pages.case_id = cases.id
        LEFT JOIN podcasts ON podcasts.case_id = cases.id
        LEFT JOIN activities ON activities.case_id = cases.id
        LEFT JOIN cards ON cards.case_id = pages.id
       GROUP BY cases.id;
       CREATE UNIQUE INDEX index_cases_search_index_en ON cases_search_index_en
             USING btree(id);
      CREATE INDEX index_cases_on_english_full_text ON cases_search_index_en
             USING gin(document);
      SQL
  end

  def drop_materialized_view
    execute <<~SQL
      DROP INDEX index_cases_on_english_full_text;
      DROP INDEX index_cases_search_index_en;
      DROP MATERIALIZED VIEW cases_search_index_en;
    SQL
  end
end
