# frozen_string_literal: true

# @see Tag
class TagsController < ApplicationController
  # @route [GET] `/tags`
  def index
    @tags = Tag.most_popular
    render json: @tags
  end
end
