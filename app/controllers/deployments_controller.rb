class DeploymentsController < ApplicationController
  before_action :set_deployment, only: [:edit, :update]
  before_action :ensure_content_item_selection_params_set!, only: [:create]

  layout 'embed'

  def create
    the_group = Group.find params[:group_id]
    the_case = Case.find_by_slug params[:case_slug]

    @deployment = Deployment.find_or_initialize_by(group: the_group, case: the_case) do |d|
      d.answers_needed = 0
    end

    if @deployment.save
      render :edit
    else
      # Something...
    end
  end

  def edit
  end

  def update
    @selection_params = session[:content_item_selection_params]
    puts @selection_params
    customizer = CustomizeDeploymentService.new @deployment

    result = customizer.customize deployment_params
    if result.errors.empty?
      render
    else
      render json: result.errors, status: :unprocessable_entity
    end
  end

  private
  def set_deployment
    @deployment = Deployment.find params[:id]
  end

  def ensure_content_item_selection_params_set!
    redirect_to root_url unless session[:content_item_selection_params]
    @selection_params = session[:content_item_selection_params]
  end

  def deployment_params
    params.require(:deployment).permit(:answers_needed, :template_id,
      custom_questions: [:content, :correct_answer, options: []])
      .to_h
      .symbolize_keys
  end
end
