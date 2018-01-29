# frozen_string_literal: true

class AddCaseLog < ActiveRecord::Migration[5.1]
  def change
    reversible do |dir|
      dir.up do
        Role.create name: :instructor

        Community.create(
          name: 'CaseLog',
          universal: true,
          description: <<~DESCRIPTION
            CaseLog is a community of practice for instructors teaching with
            cases on Gala. Case studies, like all forms of engaged learning,
            work best when they’re tuned for your specific audience. As you and
            your teaching team prepare to use a case with your students, read
            other instructors’ write-ups about what worked and what didn’t in
            their classroom. These “meta case studies” will provide some
            inspiration.\n
            After you’ve deployed this case, add your voice to the conversation.
            Share the choices you made and why you made them. Did you structure
            your classroom discussion in a particular way? Did you employ an
            interesting simulation or exercise? Tell us about it.
            DESCRIPTION
        )

        Reader.joins(:enrollments)
              .where(enrollments: { status: :instructor })
              .distinct
              .find_each { |reader| reader.add_role :instructor }
      end
      dir.down do
        Community.where(name: 'CaseLog', universal: true).each(&:destroy)

        Role.where(name: :instructor).destroy
      end
    end
  end
end
