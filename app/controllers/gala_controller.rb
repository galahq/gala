class GalaController < ApplicationController
  def open
    redirect_to "http://#{Orchard::Application.config.gala_url}"
  end
end
