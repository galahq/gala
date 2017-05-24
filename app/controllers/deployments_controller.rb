class DeploymentsController < ApplicationController
  before_action :set_deployment, only: [:edit, :update]
  before_action :ensure_content_item_selection_params_set!, only: [:create]
  after_action :clear_content_item_selection_params, only: [:update]

  layout 'embed'

  def create
    the_group = Group.find params[:group_id]
    the_case = Case.find_by_slug params[:case_slug]

    @deployment = Deployment.find_or_initialize_by(group: the_group, case: the_case) do |d|
      d.answers_needed = 0
    end

    if @deployment.save
      redirect_to edit_deployment_path @deployment
    else
      # Something...
    end
  end

  def edit
    set_selection_params
    set_recommended_quizzes
  end

  def update
    author_id = current_reader.try :id
    customizer = CustomizeDeploymentService.new @deployment, author_id, lti_uid

    result = customizer.customize **deployment_params

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

  def lti_uid
    session[:content_item_selection_params].try :[], 'lti_uid'
  end

  def set_recommended_quizzes
    reader = current_reader rescue nil
    custom_quizzes = @deployment.case.quizzes.authored_by reader: reader, lti_uid: lti_uid
    @recommended_quizzes = [] + @deployment.case.quizzes.recommended + custom_quizzes
  end

  def set_selection_params
    @selection_params = session[:content_item_selection_params]
  end

  def ensure_content_item_selection_params_set!
    redirect_to root_url unless session[:content_item_selection_params]
    set_selection_params
  end

  def clear_content_item_selection_params
    session[:content_item_selection_params] = nil
  end

  def deployment_params
    params.require(:deployment).permit(:answers_needed, :quiz_id,
      custom_questions: [:id, :content, :correct_answer, options: []])
      .to_h
      .symbolize_keys
  end
end
