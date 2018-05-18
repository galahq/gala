# frozen_string_literal: true

# @see Lock
class LocksController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_reader!

  before_action :set_locks, only: %i[index]
  before_action :set_lockable, only: %i[create]
  before_action :set_lock, only: %i[destroy]

  # @route [GET] `/cases/:slug/locks`
  def index
    render json: @locks
  end

  # @route [POST] `/locks`
  def create
    @lock = @lockable.lock_by current_user

    if @lock.present?
      render json: @lock
    else
      render json: @lockable.lock, status: :conflict
    end
  end

  # @route [DELETE] `/locks/:id`
  def destroy
    @lock.lockable.unlock
    head :no_content
  end

  private

  def set_locks
    kase = Case.friendly.find params[:case_slug]
    @locks = kase.active_locks
  end

  def set_lockable
    klass = params[:lock][:lockable_type].constantize
    @lockable = klass.find params[:lock][:lockable_id]
  rescue StandardError
    head :unprocessable_entity
  end

  def set_lock
    @lock = Lock.find params[:id]
  end
end
