# frozen_string_literal: true

class SubmissionsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz, only: %i[create]

  # One reader’s submissions to fill the submitted post-test with their answers
  # => /quizzes/:quiz_id/submissions
  #
  # All submissions from the readers in a particular deployment, for assessment
  # => /deployments/:deployment_id/submissions
  def index
    if set_quiz
      @submissions = readers_submissions_for_quiz
    elsif set_deployment
      authorize_action_for Submission, deployment: @deployment
      @submissions = all_submissions_for_deployment
    else
      head :not_found
    end

    respond_to do |format|
      format.json
      format.csv { download_as 'submissions.csv', 'text/csv' }
    end
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

  def set_deployment
    @deployment = Deployment.includes(:quiz, group: [:readers])
                            .find_by_id(params['deployment_id'])
  end

  def readers_submissions_for_quiz
    Submission.includes(:answers).where(quiz: @quiz, reader: current_reader)
  end

  def all_submissions_for_deployment
    reader_ids = @deployment.group.readers.pluck(:id)
    @quiz = @deployment.quiz

    Submission.includes(:reader, :answers)
              .where(quiz_id: @quiz.id, reader_id: reader_ids)
              .order(:created_at)
  end

  def answers
    params.require(:answers).map do |answer|
      answer.permit(:question_id, :content)
    end
  end
end
