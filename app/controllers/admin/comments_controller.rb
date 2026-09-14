# frozen_string_literal: true

module Admin
  class CommentsController < Admin::ApplicationController
    def scoped_resource
      resource_class.reorder(created_at: :desc)
    end
  end
end
