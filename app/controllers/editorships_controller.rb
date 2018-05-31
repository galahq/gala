# frozen_string_literal: true

# @see Editorship
class EditorshipsController < ApplicationController
  before_action :authenticate_reader!

  layout 'admin'

  # @param [GET] /cases/slug/editorships/new
  def new; end

  # @param [POST] /cases/slug/editorships
  def create; end

  # @param [DELETE] /editorships/id
  def destroy; end
end
