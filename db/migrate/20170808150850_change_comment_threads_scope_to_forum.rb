# frozen_string_literal: true

class ChangeCommentThreadsScopeToForum < ActiveRecord::Migration[5.0]
  def change
    add_reference :comment_threads, :forum, foreign_key: true

    reversible do |dir|
      dir.up do
        Case.find_each do |c|
          forum = Forum.create(case: c, community: nil)

          CommentThread.joins(:card)
                       .where(cards: { case_id: c.id },
                              group_id: nil)
                       .update_all forum_id: forum.id
        end
      end
      dir.down {}
    end

    remove_reference :comment_threads, :group, foreign_key: true
  end
end
