# frozen_string_literal: true

# This controller display and manages what cases a given user is allowed to edit
class MyCasesController < ApplicationController
  layout 'admin'

  before_action :authenticate_reader!, only: %i[index]

  def index
    # Asked once, for the view and for the preload below. Rolify goes to the
    # database every time it is asked.
    @site_admin = current_reader.has_role? :editor
    @cases = find_cases.decorate
  end

  private

  # The "First Editor" column renders for a site admin only, and for them
  # `CasePolicy::AdminScope` returns every case on the site — 1,531 of them in
  # production on 2026-11-09, at 6.3s to first byte. Everyone else takes the
  # slug branch and never touches editorships, so the preload is theirs alone;
  # adding it for an ordinary author would load editorships nobody reads.
  #
  # `:editorships` and not `editorships: :editor`: `Editorship` runs
  # `after_find :initialize_editor_email`, which reads the editor's email while
  # the record is being instantiated — before the nested preload could run — so
  # the editor is already loaded and preloading it removes nothing. That query
  # per row is the open half of this problem; see PR #809.
  def find_cases
    cases = CasePolicy::AdminScope.new(current_user, Case).resolve
                                  .ordered
                                  .with_attached_cover_image
                                  .includes(:library)
    return cases unless @site_admin

    cases.includes(:editorships)
  end
end
