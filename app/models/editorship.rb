# frozen_string_literal: true

# An editorship is the connection between a {Case} and a {Reader} who has the
# ability to edit it. That Reader association is called {editor} to distinguish
# it from the readers connected to a case through {Enrollment}s
class Editorship < ApplicationRecord
  belongs_to :case, inverse_of: :editorships
  belongs_to :editor, class_name: 'Reader', inverse_of: :editorships
end
