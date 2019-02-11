require "administrate/field/base"

class PercentField < Administrate::Field::Base
  def to_s
    ActionController::Base.helpers.number_to_percentage value, precision: 0
  end

  def value
    data * 100
  end
end
