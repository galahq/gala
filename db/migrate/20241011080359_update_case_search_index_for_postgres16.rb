 # frozen_string_literal: true

class UpdateCaseSearchIndexForPostgres16 < ActiveRecord::Migration[6.0]
  def up
    down

    # Update the jsonb_path_to_tsvector function to use public.tsvector_agg
    execute <<-SQL
      CREATE OR REPLACE FUNCTION public.jsonb_path_to_tsvector(jsondata jsonb, path_elems text[], OUT tsv tsvector)
      RETURNS tsvector
      LANGUAGE plpgsql
      IMMUTABLE
      AS $function$
      BEGIN
        SELECT INTO tsv
          COALESCE(
            public.tsvector_agg(to_tsvector(data #>> path_elems)),
            to_tsvector('')
          )
        FROM jsonb_array_elements(jsondata) AS data;
        RETURN;
      END;
      $function$;
    SQL

    # Create or replace the materialized view
    execute <<-SQL
      CREATE MATERIALIZED VIEW public.cases_search_index AS
      SELECT cases.id,
        (
          setweight(to_tsvector(COALESCE(cases.kicker, ''::text)), 'A') ||
          setweight(to_tsvector(COALESCE(cases.title, ''::text)), 'A') ||
          setweight(to_tsvector(COALESCE(cases.dek, ''::text)), 'A') ||
          setweight(to_tsvector(COALESCE(cases.summary, ''::text)), 'A') ||
          setweight(public.jsonb_path_to_tsvector(
            CASE
              WHEN jsonb_typeof(cases.learning_objectives) <> 'array' THEN '[]'::jsonb
              ELSE cases.learning_objectives
            END, '{}'::text[]), 'B') ||
          public.jsonb_path_to_tsvector(cases.authors, '{name}'::text[]) ||
          setweight(to_tsvector(COALESCE(string_agg(pages.title, ' '), ''::text)), 'B') ||
          setweight(to_tsvector(COALESCE(string_agg(podcasts.title, ' '), ''::text)), 'B') ||
          to_tsvector(COALESCE(string_agg(podcasts.credits, ' '), ''::text)) ||
          COALESCE(public.tsvector_agg(public.jsonb_path_to_tsvector(cards.raw_content -> 'blocks', '{text}'::text[])), to_tsvector(''))
        ) AS document
      FROM cases
        LEFT JOIN pages ON pages.case_id = cases.id
        LEFT JOIN podcasts ON podcasts.case_id = cases.id
        LEFT JOIN cards ON cards.case_id = cases.id
      GROUP BY cases.id;
    SQL

    execute <<~SQL
      CREATE UNIQUE INDEX index_cases_search_index ON public.cases_search_index (id);
      CREATE INDEX index_cases_on_full_text ON public.cases_search_index USING gin(document);
    SQL
  end

  def down
    execute <<~SQL
      DROP INDEX IF EXISTS public.index_cases_on_full_text;
      DROP INDEX IF EXISTS public.index_cases_search_index;
      DROP MATERIALIZED VIEW IF EXISTS public.cases_search_index;
    SQL
  end
end
