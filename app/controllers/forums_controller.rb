class ForumsController < ApplicationController
  def index
    kase = Case.friendly.find params[:case_slug]
    forums = policy_scope(Forum).where(case: kase)
    render json: forums
  end
end
