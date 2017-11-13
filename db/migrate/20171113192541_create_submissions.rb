# frozen_string_literal: true

class CreateSubmissions < ActiveRecord::Migration[5.1]
  def change
    create_table :submissions do |t|
      t.references :quiz, foreign_key: true
      t.references :reader, foreign_key: true

      t.timestamps
    end

    change_table :answers do |t|
      t.references :submission, foreign_key: true
    end

    reversible do |dir|
      dir.up do
        submissions = ActiveRecord::Base.connection.execute <<~SQL
          SELECT reader_id,
                 quiz_id,
                 min(created_at) AS created_at,
                 array_agg(id) AS answer_ids
            FROM answers
           GROUP BY reader_id,
                    quiz_id,
                    case_completion,
                    date_trunc('minute', created_at);
        SQL

        submissions.each do |s|
          submission = Submission.create! reader_id: s['reader_id'],
                                          quiz_id: s['quiz_id'],
                                          created_at: s['created_at']

          answer_ids = s['answer_ids'].gsub(/[^0-9,]/, '').split(',')
          Answer.where(id: answer_ids).update_all(submission_id: submission.id)
        end
      end

      dir.down {}
    end
  end
end
