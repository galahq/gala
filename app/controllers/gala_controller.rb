class GalaController < ApplicationController
  def open
    redirect_to Orchard::Application.config.gala_url
  end
end
