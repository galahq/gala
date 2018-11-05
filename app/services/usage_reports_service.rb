# frozen_string_literal: true

# Run the numbers for the usage report email
class UsageReportsService
  extend Memoist

  def initialize(from: 1.week.ago, til: Time.zone.now)
    @range = from...til
  end

  def number_of_new_users
    Reader.where(created_at: @range).count
  end

  def number_of_active_users
    Visit.where(started_at: @range).distinct.count(:user_id)
  end

  def number_of_new_deployments
    Deployment.where(created_at: @range).count
  end

  def number_of_new_enrollments
    Enrollment.where(created_at: @range).count
  end

  def number_of_newly_published_cases
    Case.where(published_at: @range).count
  end

  def most_heavily_used_cases(limit: 5)
    slugs = Ahoy::Event
            .interesting.where(time: @range)
            .group("(properties ->> 'case_slug')")
            .order('count_all desc')
            .limit(limit)
            .count.keys

    slugs.compact.map { |slug| Case.friendly.find(slug).decorate }
  end

  def number_of_new_comments
    Comment.where(created_at: @range).count
  end

  memoize :number_of_new_users, :number_of_active_users,
          :number_of_new_deployments, :number_of_new_enrollments,
          :number_of_newly_published_cases, :most_heavily_used_cases,
          :number_of_new_comments
end
