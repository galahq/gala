class AddAuthorRelationsToQuizzes < ActiveRecord::Migration[5.0]
  def change
    add_column :quizzes, :author_id, :integer
    add_column :quizzes, :lti_uid, :string
    add_index :quizzes, :author_id
    add_index :quizzes, :lti_uid
    add_index :authentication_strategies, :uid, where: "provider = 'lti'"
  end
end
