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

# Import production data if available and database is empty
if Case.count == 0 && File.exist?(Rails.root.join('tmp/gala.sql'))
  puts 'Importing production data...'
  system("PGPASSWORD=alpine psql -h db -U gala -d gala -f #{Rails.root.join('tmp/gala.sql')} > /dev/null 2>&1")
  puts 'SQL data imported successfully!'
else
  10.times { FactoryBot.create :case_with_elements, :published }
end
