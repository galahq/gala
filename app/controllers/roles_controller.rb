class RolesController < ApplicationController
  before_action :set_role

  def create
    @reader.add_role @role.name
    render js: replace_button_script
  end

  def destroy
    @reader.remove_role @role.name
    render js: replace_button_script
  end

  private
  def set_role
    @reader = Reader.find params[:reader_id]
    @role = Role.find( params[:id] || params[:role][:id] )
  end

  def replace_button_script
    "$('[data-reader-id=#{@reader.id}] form').has('[data-role-id=#{@role.id}]').replaceWith('#{view_context.toggle_role_button(@reader, @role)}')"
  end

end
