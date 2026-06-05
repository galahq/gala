# frozen_string_literal: true

# This controller display and manages what cases a given user is allowed to edit
class MyCasesController < ApplicationController
  layout 'admin'

  before_action :authenticate_reader!, only: %i[index]

  def index
    cases = find_cases.to_a
    @show_first_editor = current_reader.has_role?(:editor)
    @first_editor_names_by_case_id = @show_first_editor ? first_editor_names_by_case_id(cases) : {}
    @cases = CaseDecorator.decorate_collection(cases)
  end

  private

  def find_cases
    CasePolicy::AdminScope.new(current_user, Case).resolve
                          .ordered
                          .with_attached_cover_image
                          .includes(:library)
  end

  def first_editor_names_by_case_id(cases)
    case_ids = cases.map(&:id)
    return {} if case_ids.empty?

    Editorship.unscoped
              .joins(:editor)
              .where(case_id: case_ids)
              .reorder(Arel.sql('editorships.case_id ASC, editorships.created_at ASC'))
              .pluck(
                Arel.sql('DISTINCT ON (editorships.case_id) editorships.case_id'),
                Arel.sql('readers.name')
              )
              .to_h
  end
end
