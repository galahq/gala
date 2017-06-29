# frozen_string_literal: true

class CreateQuizTables < ActiveRecord::Migration[5.0]
  def change
    create_table :quizzes do |t|
      t.references :case, foreign_key: true
      t.references :template, index: true
      t.boolean :customized

      t.timestamps
    end

    create_table :deployments do |t|
      t.references :case, foreign_key: true
      t.references :group, foreign_key: true
      t.references :quiz, foreign_key: true

      t.timestamps
    end

    create_table :questions do |t|
      t.references :quiz, foreign_key: true
      t.hstore :content_i18n
      t.text :correct_answer
      t.string :options, default: [], array: true

      t.timestamps
    end

    create_table :answers do |t|
      t.references :question, foreign_key: true
      t.references :quiz, foreign_key: true
      t.references :reader, foreign_key: true
      t.string :content
      t.boolean :correct

      t.timestamps
    end
  end
end
