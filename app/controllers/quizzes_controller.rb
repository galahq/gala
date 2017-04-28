class QuizzesController < ApplicationController
  # before_action :authenticate_reader!
  before_action :set_quiz, except: [:create]

  def create
    if @quiz.create quiz_params
      render @quiz, status: :created
    else
      render json: @quiz.errors, status: :unprocessable_entity
    end
  end

  def update
    if @quiz.update quiz_params
      render @quiz
    else
      render json: @quiz.errors, status: :unprocessable_entity
    end
  end

  # Accept a submission of answers
  def submit
    @deployment = Group.active_for_session(session)
      .deployment_for_case(@quiz.case)

    answers = answer_params
    if Answer.create_all answers, quiz_id: @quiz.id, reader_id: current_reader.id
      render status: :created
    end
  end

  private
  def set_quiz
    @quiz = Quiz.find_by_id params[:id]
  end

  def quiz_params
    params.require(:quiz).permit(:template_id, answers: [:content])
  end

  def answer_params
    params.require(:answers).map do |answer|
      answer.permit(:question_id, :content)
    end
  end
end
