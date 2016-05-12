class CasesController < ApplicationController
  before_action :authenticate_reader_from_token!
  before_action :authenticate_reader!
  before_action :set_case, only: [:show, :update, :destroy]

  # GET /cases
  def index
    @cases = Case.all

    render json: @cases
  end

  # GET /cases/1
  def show
    render json: @case
  end

  # POST /cases
  def create
    @case = Case.new(case_params)

    if @case.save
      render json: @case, status: :created, location: @case
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /cases/1
  def update
    if @case.update(case_params)
      render json: @case
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # DELETE /cases/1
  def destroy
    @case.destroy
  end

  private
    def authenticate_reader_from_token!
      reader_email = params[:reader_email].presence
      reader = reader_email && Reader.find_by_email(reader_email)
      if reader && Devise.secure_compare(reader.authentication_token, params[:reader_token])
        sign_in reader, store: false
      end
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_case
      @case = Case.find_by_slug params[:slug]
    end

    # Only allow a trusted parameter "white list" through.
    def case_params
      params.require(:case).permit(:published, :title, :slug, :authors, :text, :summary, :tags)
    end
end
