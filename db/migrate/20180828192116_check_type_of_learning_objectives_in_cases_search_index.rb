# frozen_string_literal: true

class CheckTypeOfLearningObjectivesInCasesSearchIndex < ActiveRecord::Migration[5.2]
  def up
    execute <<~SQL
      DROP INDEX IF EXISTS index_cases_on_full_text;
      DROP INDEX IF EXISTS index_cases_search_index;
      DROP MATERIALIZED VIEW IF EXISTS cases_search_index;
    SQL

    execute <<~SQL.squish
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
               || setweight(
                    to_tsvector(
                      coalesce(string_agg(activities.title, ' '), '')
                    ),
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
        LEFT JOIN activities ON activities.case_id = cases.id
        LEFT JOIN cards ON cards.case_id = cases.id
          GROUP BY cases.id;

      CREATE UNIQUE INDEX index_cases_search_index ON cases_search_index
             USING btree(id);

      CREATE INDEX index_cases_on_full_text ON cases_search_index
             USING gin(document);
    SQL
  end
end
