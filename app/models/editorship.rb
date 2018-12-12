# frozen_string_literal: true

# An editorship is the connection between a {Case} and a {Reader} who has the
# ability to edit it. That Reader association is called {editor} to distinguish
# it from the readers connected to a case through {Enrollment}s
class Editorship < ApplicationRecord
  default_scope -> { order :created_at }

  attribute :editor_email, :string

  belongs_to :case, inverse_of: :editorships
  belongs_to :editor, class_name: 'Reader', inverse_of: :editorships

  after_find :initialize_editor_email
  before_validation :set_editor_from_email, if: :editor_email_changed?
  after_create_commit :enroll_editor_in_case

  delegate :name, to: :editor, prefix: true, allow_nil: true

  # Readers who have an editorship on the case should be automatically be
  # enrolled in it
  def enroll_editor_in_case
    Enrollment.find_or_create_by case_id: self.case.id,
                                 reader_id: editor.id
  end

  private

  def initialize_editor_email
    self.editor_email = editor&.email
    clear_attribute_changes %i[editor_email]
  end

  def set_editor_from_email
    self.editor = Reader.find_by_email editor_email
  end
end
