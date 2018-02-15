# frozen_string_literal: true

# @see Quiz
class QuizzesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz

  # @route [GET] `/quizzes/1`
  def show
    authorize @quiz
  end

  private

  def set_quiz
    @quiz = Quiz.find_by_id params[:id]
  end

  def quiz_params
    params.require(:quiz).permit(:template_id, answers: [:content])
  end
end
