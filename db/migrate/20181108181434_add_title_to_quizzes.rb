# frozen_string_literal: true

class AddTitleToQuizzes < ActiveRecord::Migration[5.2]
  def change
    add_column :quizzes, :title, :string, default: ''
  end
end
