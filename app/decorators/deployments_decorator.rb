# frozen_string_literal: true

# @see Deployment
class DeploymentsDecorator < Draper::CollectionDecorator
  def grouped
    object.includes(:case, :group).map(&:decorate).group_by(&:group)
  end
end
