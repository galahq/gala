module Admin
  class CommentThreadsController < Admin::ApplicationController
    def scoped_resource
      resource_class.includes(card: { element: :case_element })
    end
  end
end
