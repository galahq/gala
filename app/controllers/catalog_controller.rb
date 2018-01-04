# frozen_string_literal: true

class CatalogController < ApplicationController
  # GET /
  def home
    render layout: 'with_header'
  end
end
