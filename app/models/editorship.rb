# frozen_string_literal: true

# An editorship is the connection between a {Case} and a {Reader} who has the
# ability to edit it. That Reader association is called {editor} to distinguish
# it from the readers connected to a case through {Enrollment}s
class Editorship < ApplicationRecord
  belongs_to :case, inverse_of: :editorships
  belongs_to :editor, class_name: 'Reader', inverse_of: :editorships

  after_create_commit :enroll_editor_in_case

  # Readers who have an editorship on the case should be automatically be
  # enrolled in it
  def enroll_editor_in_case
    Enrollment.find_or_create_by case_id: self.case.id,
                                 reader_id: editor.id
  end
end
