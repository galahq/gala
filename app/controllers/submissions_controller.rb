# frozen_string_literal: true

class SubmissionsController < ApplicationController
  def create
    @quiz = Quiz.find_by_id params['quiz_id']
    @deployment = Group.active_for_session(session)
                       .deployment_for_case(@quiz.case)

    if Answer.create_all answers, quiz: @quiz, reader: current_reader
      render partial: 'submission', status: :created
    else
      render status: :unprocessable_entity
    end
  end

  private

  def answers
    params.require(:answers).map do |answer|
      answer.permit(:question_id, :content)
    end
  end
end
