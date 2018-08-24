# frozen_string_literal: true

# @see Library
class LibrariesController < ApplicationController
  before_action :authenticate_reader!, only: %i[index]
  before_action :set_library, only: %i[show]

  layout 'admin'

  decorates_assigned :libraries

  # @route [GET] `/libraries`
  def index
    @libraries = policy_scope Library.ordered
  end

  # @route [GET] `/libraries/slug.json`
  def show
    return head(:not_found) unless @library
  end

  private

  def set_library
    @library = Library.find_by_slug params[:slug]
    if params[:slug] == SharedCasesLibrary.instance.slug
      @library ||= SharedCasesLibrary.instance
    end
  end
end
