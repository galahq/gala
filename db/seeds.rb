# frozen_string_literal: true

I18n.locale = :en
require 'zlib'

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

seed_slugs = (1..10).map { |n| format('stats-seed-%02d', n) }
created_cases = seed_slugs.map do |slug|
  kase = Case.find_by(slug: slug)
  kase ||= FactoryBot.create :case_with_elements, :published, slug: slug
  kase
end

# Seed production-like Ahoy visits/events for the stats dashboard
puts 'Seeding stats data (cases, readers, visits, ahoy_events)...'

two_years_ago = 2.years.ago.beginning_of_day
today = Time.current
seconds_span = (today - two_years_ago).to_i

cases = created_cases
cases.each do |kase|
  # Randomize published_at within the last two years up to 30 days ago
  pub_start = two_years_ago
  pub_end = 30.days.ago
  published_at = Time.at(rand(pub_start.to_f..pub_end.to_f))

  kase.update_columns(
    created_at: published_at - 30.days,
    updated_at: published_at,
    published_at: published_at
  )
end

# Create a deterministic number (0–10) of deployments per case so the
# stats dashboard can show deployment counts. Idempotent on re-run.
cases.each do |kase|
  # Deterministic target count per case based on slug
  target_count = Zlib.crc32(kase.slug).modulo(11)
  existing = kase.deployments.count
  needed = target_count - existing
  next if needed <= 0

  seconds_span = (today - two_years_ago).to_i

  needed.times do |n|
    index = existing + n
    # Groups are idempotent via unique context_id
    context_id = "stats-seed-#{kase.slug}-#{index}"
    group = Group.find_or_create_by!(context_id: context_id) do |g|
      g.name = { en: "Stats Group #{kase.slug} #{index}" }
    end

    created_time = two_years_ago + rand(0..seconds_span).seconds

    deployment = Deployment.where(case: kase, group: group).first_or_initialize
    next unless deployment.new_record?

    deployment.answers_needed = [0, 1, 2].sample
    # If quizzes are required, ensure a quiz exists and attach it
    if deployment.answers_needed.positive?
      quiz = kase.quizzes.first
      unless quiz
        quiz = Quiz.new(case: kase, title: 'Seed quiz')
        # Save without validation, then add a question to satisfy it thereafter
        quiz.save_without_validation!
        Question.create!(
          quiz: quiz,
          content: { en: 'What is the capital of France?' },
          correct_answer: 'Paris',
          options: []
        )
      end
      deployment.quiz = quiz
    end
    deployment.save!
    deployment.update_columns(created_at: created_time,
                              updated_at: created_time)
  end
end

locales = %w[en es fr ja zh-CN zh-TW]
countries = [
  'United States', 'Canada', 'Mexico', 'Brazil', 'Germany', 'France',
  'United Kingdom', 'India', 'Indonesia', 'Australia'
]
regions = %w[
  California Texas Ontario Quebec Bavaria Île-de-France
  Karnataka Jakarta NSW
]
cities = [
  'San Francisco', 'Austin', 'Toronto', 'Montreal', 'Munich', 'Paris',
  'Bengaluru', 'Jakarta', 'Sydney'
]

readers = (1..20).map do |i|
  email = format('stats-user-%03d@example.com', i)
  Reader.find_or_create_by!(email: email) do |r|
    r.locale = locales[(i - 1) % locales.length]
    r.password = Devise.friendly_token[0, 20]
    r.created_password = true
    r.send_reply_notifications = true
    r.terms_of_service = 0
    r.confirmed_at = Time.current
  end
end
readers.first(2).each do |r|
  r.add_role(:invisible) unless r.has_role?(:invisible)
end

# Enrollments: ensure each case has 1–10 enrollments (idempotent)
cases.each do |kase|
  target = rand(1..10)
  readers.sample(target).each do |reader|
    Enrollment.find_or_create_by!(reader: reader, case: kase)
  end
end

# Group memberships and submissions per deployment (idempotent)
cases.each do |kase|
  kase.deployments.includes(:group, :quiz).find_each do |deployment|
    group = deployment.group
    next unless group

    # Ensure an admin manager for the group
    admin_reader = readers.sample
    gm = GroupMembership.find_or_create_by(group: group, reader: admin_reader)
    if gm.status != 'admin'
      gm.update_columns(status: 1) # 1 == admin
    end

    # Ensure a handful of normal members
    normal_count = rand(3..8)
    readers.sample(normal_count).each do |reader|
      GroupMembership.find_or_create_by(group: group, reader: reader)
    end

    # Create quiz submissions for members if this deployment uses a quiz
    if deployment.quiz
      member_ids = GroupMembership.where(group: group).pluck(:reader_id)
      submission_readers = Reader.where(id: member_ids.sample(3))
      submission_readers.each do |reader|
        s = Submission.find_or_initialize_by(quiz: deployment.quiz, reader: reader)
        next if s.persisted?

        # Spread submissions across the timeline after case publish
        start_time = kase.published_at || two_years_ago
        s.created_at = start_time + rand(0..seconds_span).seconds
        s.save!
      end
    end

    # Ensure some discussion on the forum tied to this group's community
    begin
      forum = group.community&.forums&.find_by(case_id: kase.id) ||
              Forum.create!(case: kase, community: group.community)
      existing_threads = CommentThread.where(forum: forum).count
      if existing_threads.zero?
        threads_to_create = rand(1..2)
        threads_to_create.times do
          thread_reader = readers.sample
          thread = CommentThread.create!(forum: forum, reader: thread_reader)
          base_time = (kase.published_at || two_years_ago) +
                      rand(0..seconds_span).seconds
          thread.update_columns(created_at: base_time, updated_at: base_time)

          rand(1..3).times do
            c = Comment.create!(
              reader: readers.sample,
              comment_thread: thread,
              content: Faker::Hipster.sentence
            )
            c_time = base_time + rand(0..86_400).seconds
            c.update_columns(created_at: c_time, updated_at: c_time)
          end
        end
      end
    rescue StandardError
      # ignore seeding discussion errors to keep idempotency robust
    end
  end
end

# Basic discussion data: comment threads and comments (idempotent)
cases.each do |kase|
  # Prefer an existing forum; create a default one if missing
  forum = Forum.where(case_id: kase.id).first || Forum.create!(case: kase)

  case_comment_count = Comment.joins(comment_thread: :forum)
                              .where(forums: { case_id: kase.id }).count
  next if case_comment_count.positive?

  # Create a few threads with a few comments each
  thread_total = rand(2..4)
  thread_total.times do |ti|
    thread = CommentThread.create!(forum: forum, reader: readers.sample)
    thread_time = (kase.published_at || two_years_ago) +
                  rand(0..seconds_span).seconds
    thread.update_columns(created_at: thread_time, updated_at: thread_time)

    rand(1..3).times do |ci|
      c = Comment.create!(
        reader: readers.sample,
        comment_thread: thread,
        content: "Seeded comment #{ti + 1}-#{ci + 1}"
      )
      c_time = thread_time + rand(0..86_400).seconds
      c.update_columns(created_at: c_time, updated_at: c_time)
    end
  end
end

# Translations: ensure at least 3 translations for base case id=1 in es/fr
base_case = Case.find_by(id: 1)
if base_case
  translation_specs = [
    { locale: 'es', suffix: 'es-1' },
    { locale: 'fr', suffix: 'fr-1' },
    { locale: 'es', suffix: 'es-2' }
  ]
  translation_specs.each do |spec|
    slug = "#{base_case.slug}-#{spec[:suffix]}"
    pub_at = base_case.published_at || 60.days.ago
    tr = Case.find_or_create_by!(slug: slug) do |t|
      t.locale = spec[:locale]
      t.published_at = pub_at
      t.translation_base_id = base_case.id
      t.title = base_case.title.presence || slug.tr('-', ' ').capitalize
    end
    # Ensure existing translations have a published_at set
    tr.update_columns(published_at: pub_at) if tr.published_at.nil?
  end
end

# Ensure at least one Ahoy::Event of each known type per case, tied via case_slug
canonical_event_names = %w[
  visit_page
  visit_element
  read_quiz
  read_overview
  read_card
  visit_podcast
  visit_edgenote
]

cases.each do |kase|
  base_time = (kase.published_at || two_years_ago) + 2.days
  vt = "stats-seed-canonical-#{kase.slug}"
  visit = Visit.find_or_create_by!(visit_token: vt) do |v|
    v.visitor_token = "v-#{SecureRandom.hex(6)}"
    v.user_agent = 'Mozilla/5.0'
    v.started_at = base_time
    v.user_id = readers.first&.id
  end

  canonical_event_names.each_with_index do |name, idx|
    t = base_time + idx.minutes
    Ahoy::Event.find_or_create_by!(visit_id: visit.id, name: name, time: t) do |e|
      e.user_id = visit.user_id
      e.properties = { 'case_slug' => kase.slug }
    end
  end
end

total_visits = 600
seconds_span = (today - two_years_ago).to_i

(1..total_visits).each do |i|
  t = two_years_ago + (seconds_span * i.fdiv(total_visits))
  t = Time.at(t.to_i)
  reader = readers[(i - 1) % readers.length]
  kase = cases[(i - 1) % cases.length]

  visit_token = format('stats-visit-%04d', i)
  visitor_token = format('stats-visitor-%04d', i)

  visit = Visit.find_or_initialize_by(visit_token: visit_token)
  visit.assign_attributes(
    visitor_token: visitor_token,
    ip: "192.0.2.#{(i % 254) + 1}",
    user_agent: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Mozilla/5.0 (X11; Linux x86_64)'
    ][i % 3],
    user_id: reader.id,
    referring_domain: %w[google.com bing.com direct][i % 3],
    browser: %w[Chrome Firefox Safari Edge][i % 4],
    os: %w[MacOS Windows Linux iOS Android][i % 5],
    device_type: %w[Desktop Mobile Tablet][i % 3],
    screen_height: [768, 800, 900, 1080, 1440][i % 5],
    screen_width: [1024, 1280, 1366, 1920, 2560][i % 5],
    country: countries[(i - 1) % countries.length],
    region: regions[(i - 1) % regions.length],
    city: cities[(i - 1) % cities.length],
    utm_source: %w[organic referral direct email][i % 4],
    utm_medium: %w[cpc email social none][i % 4],
    utm_campaign: %w[winter spring fall none][i % 4],
    started_at: t
  )
  visit.save!

  evt1_time = t + 30.minutes
  evt1 = Ahoy::Event.find_or_initialize_by(
    visit_id: visit.id, name: 'visit_case', time: evt1_time
  )
  evt1.user_id = reader.id
  evt1.properties = { 'case_slug' => kase.slug }
  evt1.save!

  next unless (i % 3).zero?

  els = kase.case_elements
  el = els.offset((i - 1) % els.count).first if els.any?

  evt2_time = t + 60.minutes
  evt2 = Ahoy::Event.find_or_initialize_by(
    visit_id: visit.id, name: 'visit_element', time: evt2_time
  )
  evt2.user_id = reader.id
  evt2.properties = {
    'case_slug' => kase.slug,
    'element_type' => el&.element_type || 'Card',
    'element_id' => el&.element_id || 1
  }
  evt2.save!
end

puts 'Stats data seeding complete.'
