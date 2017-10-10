# frozen_string_literal: true

class QuizzesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz, except: [:create]
  authorize_actions_for Quiz, except: [:show]

  def show
    authorize_action_for @quiz
  end

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

  private

  def set_quiz
    @quiz = Quiz.find_by_id params[:id]
  end

  def quiz_params
    params.require(:quiz).permit(:template_id, answers: [:content])
  end
end
