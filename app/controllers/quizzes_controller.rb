# frozen_string_literal: true

# @see Quiz
class QuizzesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz, only: %i[show]
  before_action :set_case, only: %i[create]

  # @route [GET] `/quizzes/1`
  def show
    authorize @quiz
  end

  # @route [POST] `/cases/slug/quizzes`
  def create
    authorize @case, :update?
    render json: @case.quizzes.create
  end

  private

  def set_quiz
    @quiz = Quiz.find_by_id params[:id]
  end

  def set_case
    @case = Case.find_by_slug params[:case_slug]
  end

  def quiz_params
    params.require(:quiz).permit(:template_id, answers: [:content])
  end
end
