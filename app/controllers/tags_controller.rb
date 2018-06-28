# frozen_string_literal: true

# @see Tag
class TagsController < ApplicationController
  def index
    @tags = Tag.most_popular
    render json: @tags
  end
end
