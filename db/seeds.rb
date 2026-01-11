# frozen_string_literal: true

I18n.locale = :en

%i[editor invisible instructor].map { |role| Role.find_or_create_by name: role }

Community.find_or_create_by name: 'CaseLog', universal: true, description: <<~DESCRIPTION
  CaseLog is a community of practice for instructors teaching with cases on
  Gala. Case studies, like all forms of engaged learning, work best when they’re
  tuned for your specific audience. As you and your teaching team prepare to use
  a case with your students, read other instructors’ write-ups about what worked
  and what didn’t in their classroom. These “meta case studies” will provide
  some inspiration.

  After you’ve deployed this case, add your voice to the conversation. Share
  the choices you made and why you made them. Did you structure your classroom
  discussion in a particular way? Did you employ an interesting simulation or
  exercise? Tell us about it.
DESCRIPTION

if defined? DEV_MOCK_AUTH_HASH
  auth = AuthenticationStrategy.from_omniauth DEV_MOCK_AUTH_HASH
  reader = auth.reader

  reader.add_role :editor
  reader.add_role :invisible
end

if Rails.env.development?
  10.times { FactoryBot.create :case_with_elements, :published } if Case.all.empty?

  readers = 10.times.map { FactoryBot.create(:reader) }

  COUNTRIES = %w[US US US CA CA GB GB DE FR IN AU BR JP MX ZA NG KE EG].freeze

  Case.published.limit(5).each do |kase|
    rand(1..3).times { FactoryBot.create(:deployment, case: kase) }

    rand(50..150).times do
      reader = readers.sample
      country = COUNTRIES.sample
      event_time = rand(365 * 2).days.ago + rand(24).hours

      visit = FactoryBot.create(:visit,
                                user: reader,
                                country: country,
                                started_at: event_time)

      rand(1..5).times do
        FactoryBot.create(:ahoy_event,
                          visit: visit,
                          user: reader,
                          case_slug: kase.slug,
                          name: %w[visit_case visit_page visit_podcast].sample,
                          time: event_time + rand(30).minutes)
      end
    end
  end
end
