# frozen_string_literal: true

# @see Lock
class LocksController < ApplicationController
  before_action :authenticate_reader!

  before_action :set_locks, only: %i[index]
  before_action :set_lockable, only: %i[create]
  before_action :set_lock, only: %i[destroy]

  # @route [GET] `/cases/:slug/locks`
  def index
    authorize @case, :update?
    render json: @locks
  end

  # @route [POST] `/locks`
  def create
    authorize @lockable, :update?
    @lock = @lockable.lock_by current_user

    if @lock.present?
      render json: @lock, status: :created
    else
      render json: @lockable.lock, status: :conflict
    end
  end

  # @route [DELETE] `/locks/:id`
  def destroy
    authorize @lock.lockable, :update?
    @lock.lockable.unlock
    head :no_content
  end

  private

  def set_locks
    @case = Case.friendly.find params[:case_slug]
    @locks = @case.active_locks
  end

  def set_lockable
    klass = params[:lock][:lockable_type].constantize
    param_name = lockable_param klass
    @lockable = klass.find_by! param_name => params[:lock][:lockable_param]
  rescue ActiveRecord::RecordNotFound, NameError
    head :unprocessable_entity
  end

  def set_lock
    @lock = Lock.find params[:id]
  end

  def lockable_param(klass)
    return :id unless klass.respond_to? :friendly
    klass.friendly_id_config.base
  end
end
