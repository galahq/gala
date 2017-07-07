# frozen_string_literal: true

class ConvertFromTrastoToMobility < ActiveRecord::Migration[5.0]
  def change
    # Add JSONB columns
    add_column :activities, :title, :jsonb, default: ''
    add_column :activities, :description, :jsonb, default: ''
    add_column :activities, :pdf_url, :jsonb, default: ''
    add_column :cards, :content, :jsonb, default: ''
    add_column :cards, :raw_content, :jsonb, default: ''
    add_column :cases, :title, :jsonb, default: ''
    add_column :cases, :summary, :jsonb, default: ''
    add_column :cases, :narrative, :jsonb, default: ''
    add_column :cases, :translators, :jsonb, default: ''
    add_column :cases, :kicker, :jsonb, default: ''
    add_column :cases, :dek, :jsonb, default: ''
    add_column :comments, :content, :jsonb, default: ''
    add_column :edgenotes, :caption, :jsonb, default: ''
    add_column :edgenotes, :content, :jsonb, default: ''
    add_column :edgenotes, :instructions, :jsonb, default: ''
    add_column :edgenotes, :image_url, :jsonb, default: ''
    add_column :edgenotes, :website_url, :jsonb, default: ''
    add_column :edgenotes, :embed_code, :jsonb, default: ''
    add_column :edgenotes, :photo_credit, :jsonb, default: ''
    add_column :edgenotes, :pdf_url, :jsonb, default: ''
    add_column :edgenotes, :pull_quote, :jsonb, default: ''
    add_column :edgenotes, :attribution, :jsonb, default: ''
    add_column :edgenotes, :call_to_action, :jsonb, default: ''
    add_column :edgenotes, :audio_url, :jsonb, default: ''
    add_column :edgenotes, :youtube_slug, :jsonb, default: ''
    add_column :groups, :name, :jsonb, default: ''
    add_column :pages, :title, :jsonb, default: ''
    add_column :podcasts, :title, :jsonb, default: ''
    add_column :podcasts, :audio_url, :jsonb, default: ''
    add_column :podcasts, :description, :jsonb, default: ''
    add_column :podcasts, :credits, :jsonb, default: ''
    add_column :questions, :content, :jsonb, default: ''

    # Copy data
    reversible do |dir|
      dir.up do
        Activity.update_all 'title = hstore_to_jsonb(title_i18n)'
        Activity.update_all 'description = hstore_to_jsonb(description_i18n)'
        Activity.update_all 'pdf_url = hstore_to_jsonb(pdf_url_i18n)'
        Card.update_all 'content = hstore_to_jsonb(content_i18n)'
        Card.update_all 'raw_content = hstore_to_jsonb(raw_content_i18n)'
        Case.update_all 'title = hstore_to_jsonb(title_i18n)'
        Case.update_all 'summary = hstore_to_jsonb(summary_i18n)'
        Case.update_all 'narrative = hstore_to_jsonb(narrative_i18n)'
        Case.update_all 'translators = hstore_to_jsonb(translators_i18n)'

        Case.all.each do |c|
          translators = c.read_attribute(:translators).each_pair.each_with_object({}) do |pair, h|
            h[pair.first] = JSON.parse pair.second
          end
          c.write_attribute :translators, translators
          c.save
        end

        Case.update_all 'kicker = hstore_to_jsonb(kicker_i18n)'
        Case.update_all 'dek = hstore_to_jsonb(dek_i18n)'
        Comment.update_all 'content = hstore_to_jsonb(content_i18n)'
        Edgenote.update_all 'caption = hstore_to_jsonb(caption_i18n)'
        Edgenote.update_all 'content = hstore_to_jsonb(content_i18n)'
        Edgenote.update_all 'instructions = hstore_to_jsonb(instructions_i18n)'
        Edgenote.update_all 'image_url = hstore_to_jsonb(image_url_i18n)'
        Edgenote.update_all 'website_url = hstore_to_jsonb(website_url_i18n)'
        Edgenote.update_all 'embed_code = hstore_to_jsonb(embed_code_i18n)'
        Edgenote.update_all 'photo_credit = hstore_to_jsonb(photo_credit_i18n)'
        Edgenote.update_all 'pdf_url = hstore_to_jsonb(pdf_url_i18n)'
        Edgenote.update_all 'pull_quote = hstore_to_jsonb(pull_quote_i18n)'
        Edgenote.update_all 'attribution = hstore_to_jsonb(attribution_i18n)'
        Edgenote.update_all 'call_to_action = hstore_to_jsonb(call_to_action_i18n)'
        Edgenote.update_all 'audio_url = hstore_to_jsonb(audio_url_i18n)'
        Edgenote.update_all 'youtube_slug = hstore_to_jsonb(youtube_slug_i18n)'
        Group.update_all 'name = hstore_to_jsonb(name_i18n)'
        Page.update_all 'title = hstore_to_jsonb(title_i18n)'
        Podcast.update_all 'title = hstore_to_jsonb(title_i18n)'
        Podcast.update_all 'audio_url = hstore_to_jsonb(audio_url_i18n)'
        Podcast.update_all 'description = hstore_to_jsonb(description_i18n)'
        Podcast.update_all 'credits = hstore_to_jsonb(credits_i18n)'
        Question.update_all 'content = hstore_to_jsonb(content_i18n)'
      end
      dir.down do
        raise ActiveRecord::IrreversibleMigration
      end
    end

    # Remove hstore columns
    remove_column :activities, :title_i18n, :hstore
    remove_column :activities, :description_i18n, :hstore
    remove_column :activities, :pdf_url_i18n, :hstore
    remove_column :cards, :content_i18n, :hstore
    remove_column :cards, :raw_content_i18n, :hstore
    remove_column :cases, :title_i18n, :hstore
    remove_column :cases, :summary_i18n, :hstore
    remove_column :cases, :narrative_i18n, :hstore
    remove_column :cases, :translators_i18n, :hstore, default: { 'en' => '[]' }
    remove_column :cases, :kicker_i18n, :hstore
    remove_column :cases, :dek_i18n, :hstore
    remove_column :comments, :content_i18n, :hstore
    remove_column :edgenotes, :caption_i18n, :hstore
    remove_column :edgenotes, :content_i18n, :hstore
    remove_column :edgenotes, :instructions_i18n, :hstore
    remove_column :edgenotes, :image_url_i18n, :hstore
    remove_column :edgenotes, :website_url_i18n, :hstore
    remove_column :edgenotes, :embed_code_i18n, :hstore
    remove_column :edgenotes, :photo_credit_i18n, :hstore
    remove_column :edgenotes, :pdf_url_i18n, :hstore
    remove_column :edgenotes, :pull_quote_i18n, :hstore
    remove_column :edgenotes, :attribution_i18n, :hstore
    remove_column :edgenotes, :call_to_action_i18n, :hstore
    remove_column :edgenotes, :audio_url_i18n, :hstore
    remove_column :edgenotes, :youtube_slug_i18n, :hstore
    remove_column :groups, :name_i18n, :hstore
    remove_column :pages, :title_i18n, :hstore
    remove_column :podcasts, :title_i18n, :hstore
    remove_column :podcasts, :audio_url_i18n, :hstore
    remove_column :podcasts, :description_i18n, :hstore
    remove_column :podcasts, :credits_i18n, :hstore
    remove_column :questions, :content_i18n, :hstore

    disable_extension 'hstore'
  end
end
