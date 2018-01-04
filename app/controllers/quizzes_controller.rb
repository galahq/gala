# frozen_string_literal: true

class QuizzesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz

  def show
    authorize_action_for @quiz
  end

  private

  def set_quiz
    @quiz = Quiz.find_by_id params[:id]
  end

  def quiz_params
    params.require(:quiz).permit(:template_id, answers: [:content])
  end
end
