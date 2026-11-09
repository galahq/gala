# frozen_string_literal: true

# This controller display and manages what cases a given user is allowed to edit
class MyCasesController < ApplicationController
  layout 'admin'

  before_action :authenticate_reader!, only: %i[index]

  def index
    @cases = find_cases.decorate
  end

  private

  # `editorships: :editor` is for the "First Editor" column the index renders
  # for a site admin. `Editorship` delegates `editor_name` to its editor, so
  # without the preload each row costs two queries — one for the editorship,
  # one for the reader — and a site admin's list is every case on the site.
  # Measured on production, 2026-11-09: 1,531 cases, ~3,000 queries, 6.3s
  # before the first byte.
  def find_cases
    CasePolicy::AdminScope.new(current_user, Case).resolve
                          .ordered
                          .with_attached_cover_image
                          .includes(:library, editorships: :editor)
  end
end
