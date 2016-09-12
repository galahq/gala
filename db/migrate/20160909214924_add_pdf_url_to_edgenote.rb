class AddPdfUrlToEdgenote < ActiveRecord::Migration[5.0]
  def change
    add_column :edgenotes, :pdf_url_i18n, :hstore
  end
end
