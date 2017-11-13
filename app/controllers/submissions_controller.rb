# frozen_string_literal: true

class SubmissionsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz

  def index
    @answers = current_reader.answers
                             .merge(@quiz.answers)
                             .order(:created_at)
  end

  def create
    enrollment = current_reader.enrollment_for_case @quiz.case
    @deployment = enrollment.active_group.deployment_for_case(@quiz.case)

    if Submission.create answers: answers, quiz: @quiz, reader: current_reader
      render partial: 'submission', status: :created
    else
      render status: :unprocessable_entity
    end
  end

  private

  def set_quiz
    @quiz = Quiz.find_by_id params['quiz_id']
  end

  def answers
    params.require(:answers).map do |answer|
      answer.permit(:question_id, :content)
    end
  end
end
