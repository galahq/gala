FactoryBot.define do
  factory :reply_notification do
    association :reader
    association :comment

    after :build do |this|
      this.notifier = this.comment.reader
      this.comment_thread = this.comment.comment_thread
      this.case = this.comment_thread.forum.case
    end
  end
end