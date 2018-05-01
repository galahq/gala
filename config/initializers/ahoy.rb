# frozen_string_literal: true

Ahoy.api = true
Ahoy.server_side_visits = false

class Ahoy::Store < Ahoy::DatabaseStore
  def user
    controller.current_reader
  end

  def visit_model
    Visit
  end
end
