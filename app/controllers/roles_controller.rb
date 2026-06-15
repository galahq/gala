# frozen_string_literal: true

# @see Role
class RolesController < ApplicationController
  before_action :set_role

  # @route [POST] `/readers/1/roles`
  def create
    @reader.add_role @role.name
    head :no_content
  end

  # @route [DELETE] `/readers/1/roles/1`
  def destroy
    @reader.remove_role @role.name
    head :no_content
  end

  private

  def set_role
    @reader = Reader.find params[:reader_id]
    @role = Role.find(params[:id] || params[:role][:id])
  end
end
