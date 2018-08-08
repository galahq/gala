# frozen_string_literal: true

class ConvertTranslatedColumnsToCopiedModels < ActiveRecord::Migration[5.2]
  COLUMNS = {
    %i[activities pdf_url] => :text,
    %i[activities title] => :text,
    %i[cards raw_content] => :jsonb,
    %i[cases acknowledgements] => :text,
    %i[cases audience] => :text,
    %i[cases authors] => :jsonb,
    %i[cases classroom_timeline] => :text,
    %i[cases dek] => :text,
    %i[cases kicker] => :text,
    %i[cases learning_objectives] => :jsonb,
    %i[cases summary] => :text,
    %i[cases title] => :text,
    %i[cases translators] => :jsonb,
    %i[edgenotes attribution] => :text,
    %i[edgenotes audio_url] => :text,
    %i[edgenotes call_to_action] => :text,
    %i[edgenotes caption] => :text,
    %i[edgenotes content] => :text,
    %i[edgenotes embed_code] => :text,
    %i[edgenotes image_url] => :text,
    %i[edgenotes instructions] => :text,
    %i[edgenotes pdf_url] => :text,
    %i[edgenotes photo_credit] => :text,
    %i[edgenotes pull_quote] => :text,
    %i[edgenotes website_url] => :text,
    %i[pages title] => :text,
    %i[podcasts audio_url] => :text,
    %i[podcasts credits] => :text,
    %i[podcasts title] => :text
  }.freeze

  def up
    reforming_search_index do
      changing_column_types do
        make_clones_for_each_locale_of_title
        copy_localized_data_to_new_columns
        clone_localized_edgenotes
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration # lol nope
  end

  private

  def without_updating_timestamps
    ActiveRecord::Base.record_timestamps = false
    begin
      yield
    ensure
      ActiveRecord::Base.record_timestamps = true
    end
  end

  def reforming_search_index
    drop_materialized_view
    yield
    update_materialized_view
  end

  def changing_column_types
    rename_all_translated_columns
    create_new_columns
    refresh_column_information
    yield
    restore_working_defaults
    delete_translated_columns
  end

  def drop_materialized_view
    execute <<~SQL
      DROP INDEX index_cases_on_english_full_text;
      DROP INDEX index_cases_search_index_en;
      DROP MATERIALIZED VIEW cases_search_index_en;
    SQL
  end

  def update_materialized_view
    execute <<~SQL
      CREATE MATERIALIZED VIEW cases_search_index AS
      SELECT cases.id AS id,
             setweight(to_tsvector(cases.kicker), 'A')
               || setweight(to_tsvector(cases.title), 'A')
               || setweight(to_tsvector(cases.dek), 'A')
               || setweight(to_tsvector(cases.summary), 'A')
               || setweight(to_tsvector(cases.learning_objectives::text), 'B')
               || to_tsvector(cases.authors::text)
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
               || to_tsvector(
                    coalesce(
                      string_agg(cards.raw_content->>'blocks', ' '),
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
      CREATE UNIQUE INDEX index_cases_search_index ON cases_search_index
             USING btree(id);
      CREATE INDEX index_cases_on_full_text ON cases_search_index
             USING gin(document);
    SQL
  end

  def make_clones_for_each_locale_of_title
    Case.find_each do |kase|
      keys = begin
               kase.title_i18n.keys
             rescue StandardError
               []
             end

      (keys - ['en']).each do |locale|
        CaseCloner.call(kase, locale: locale)
      end
    end
  end

  def rename_all_translated_columns
    COLUMNS.keys.each do |table, attribute|
      rename_column table, attribute, renamed(attribute)
    end
  end

  def create_new_columns
    COLUMNS.each do |(table, attribute), type|
      add_column table, attribute, type, default: ''
    end
  end

  def refresh_column_information
    [Activity, Card, Case, Edgenote, Page, Podcast]
      .each(&:reset_column_information)
  end

  def copy_localized_data_to_new_columns
    without_updating_timestamps do
      Case.find_each do |kase|
        relations = relations_for(kase)
        COLUMNS.keys.each do |(table, attribute)|
          relations[table].each do |record|
            copy_localized_data record, attribute, kase.locale
          end
        end
      end
    end
  end

  def relations_for(kase)
    %i[activities cards edgenotes pages podcasts]
      .each_with_object({}) { |name, hash| hash[name] = kase.send name }
      .tap { |hash| hash[:cases] = [kase] }
  end

  def copy_localized_data(record, attribute, locale)
    record.update_column(
      attribute, localized_value(record, attribute, locale: locale)
    )
  end

  def localized_value(record, attribute, locale:)
    translations = record.send(renamed(attribute))
    translations&.[](locale) || translations&.[]('en')
  rescue TypeError
    nil
  end

  def clone_localized_edgenotes
    Case.where.not(locale: 'en').each do |kase|
      clone_raw_contents_to_make_new_edgenotes kase
      copy_localized_data_for_new_edgenotes kase
    end
  end

  def clone_raw_contents_to_make_new_edgenotes(kase)
    kase.cards.each do |card|
      raw_content = ContentStateCloner.call(card.raw_content, kase: kase)
      without_updating_timestamps { card.update(raw_content: raw_content) }
    end
  end

  def copy_localized_data_for_new_edgenotes(kase)
    without_updating_timestamps do
      kase.edgenotes.each do |edgenote|
        COLUMNS.keys.select { |(table)| table == :edgenotes }
               .each do |(_, attribute)|
          copy_localized_data edgenote, attribute, locale: kase.locale
        end
      end
    end
  end

  def restore_working_defaults
    Case.where(translators: nil).update_all translators: []
    Case.where(authors: nil).update_all authors: []
  end

  def delete_translated_columns
    COLUMNS.keys.each do |table, attribute|
      remove_column table, renamed(attribute)
    end
  end

  def renamed(column)
    "#{column}_i18n"
  end
end
