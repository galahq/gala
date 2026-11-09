# frozen_string_literal: true

# @see Role
class RolesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_role

  # The buttons on /readers post with `remote: true`, so a click asks for
  # JavaScript and expects create.js.erb / destroy.js.erb to swap the button in
  # place. `5af07647` answered `head :no_content` for every format, which left
  # the role granted and the button still reading "Make editor" — it looked
  # broken. Dropping that line outright is not enough either: because a `.js`
  # template exists, Rails answers any other format with 406 rather than 204,
  # which would break the React client that posts these as JSON. So each format
  # is answered on purpose.
  #
  # `format.any` is declared FIRST on purpose. `negotiate_mime` returns the
  # first declared format as soon as it meets `*/*` in the request, so with
  # `format.js` first a bare `curl` or a `fetch` that sets no Accept header
  # would be handed an executable button-swap instead of 204. rails-ujs names
  # `text/javascript` ahead of its `*/*`, so it still gets the template.
  #
  # @route [POST] `/readers/1/roles`
  def create
    authorize @role
    @reader.add_role @role.name
    respond_to do |format|
      format.any { head :no_content }
      format.js
    end
  end

  # @route [DELETE] `/readers/1/roles/1`
  def destroy
    authorize @role
    @reader.remove_role @role.name
    respond_to do |format|
      format.any { head :no_content }
      format.js
    end
  end

  private

  def set_role
    @reader = Reader.find params[:reader_id]
    @role = Role.find(params[:id] || params[:role][:id])
  end
end
