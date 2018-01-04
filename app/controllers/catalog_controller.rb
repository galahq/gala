# frozen_string_literal: true

class CatalogController < ApplicationController
  def home
    render layout: 'with_header'
  end
end
