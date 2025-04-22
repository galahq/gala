# frozen_string_literal: true

# @see Quiz
class QuizzesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz, only: %i[show update destroy]
  before_action :set_case, only: %i[index create]

  # @route [GET] `/cases/slug/quizzes`
  def index
    authorize @case, :update?
    render json: @case.quizzes.suggested
  end

  # @route [GET] `/quizzes/1`
  def show
    authorize @quiz
  end

  # @route [POST] `/cases/slug/quizzes`
  def create
    authorize @case, :update?
    render json: @case.quizzes.create
  end

  # @route [PUT|PATCH] `/quizzes/1`
  def update
    authorize @quiz.case

    if QuizUpdater.new(@quiz).update quiz_params
      render json: @quiz
    else
      render json: @quiz.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/quizzes/1`
  def destroy
    authorize @quiz.case, :update?
    @quiz.destroy!
  end

  private

  def set_quiz
    @quiz = Quiz.find_by_id params[:id]
  end

  def set_case
    @case = Case.find_by_slug params[:case_slug]
  end

  def quiz_params
    params.require(:quiz).permit(
      :title, questions: [:id, :content, :correct_answer, { options: [] }]
    )
  end
end
