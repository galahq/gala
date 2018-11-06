# frozen_string_literal: true

# @see Submission
class SubmissionsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_quiz, only: %i[create]

  # @route [GET] `/quizzes/1/submissions`
  # One reader’s submissions to fill the submitted post-test with their answers
  #
  # @route [GET] `/deployments/1/submissions`
  # All submissions from the readers in a particular deployment, for assessment
  def index
    if set_quiz
      @submissions = readers_submissions_for_quiz
    elsif set_deployment
      authorize @deployment, :update?
      @submissions = all_submissions_for_deployment
    else
      head :not_found
    end

    respond_to do |format|
      format.json
      format.csv { download_as 'submissions.csv', 'text/csv' }
    end
  end

  # @route [POST] `/quizzes/1/submissions`
  def create
    enrollment = current_reader.enrollment_for_case @quiz.case
    @deployment = enrollment.active_group.deployment_for_case(@quiz.case)

    if Submission.create answers: answers, quiz: @quiz, reader: current_reader
      render partial: 'submission', locals: { deployment: @deployment },
             status: :created
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
              .where(quiz_id: @quiz.ancestors.pluck(:id),
                     reader_id: reader_ids)
  end

  def answers
    params.require(:answers).map do |answer|
      answer.permit(:question_id, :content)
    end
  end
end
