# frozen_string_literal: true

# @see CaseLibraryRequest
class CaseLibraryRequestSerializer < ApplicationSerializer
  attributes :status
  attribute(:case_title) { object.case.title }
  attribute(:case_kicker) { object.case.kicker }
  attribute(:library_name) { object.library.name }
  attribute(:requester_name) { object.requester.name }
  attribute(:url) { edit_library_path(object.library) }
end
