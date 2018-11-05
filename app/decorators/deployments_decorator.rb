# frozen_string_literal: true

# @see Deployment
class DeploymentsDecorator < Draper::CollectionDecorator
  def grouped
    object.includes(:case, :group)
          .map(&:decorate)
          .sort_by { |deployment| deployment.case.short_title }
          .group_by(&:group)
          .sort_by { |group, _| group.name }
  end
end
