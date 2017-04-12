class ReadersController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_reader, only: [:show, :edit, :update, :destroy]
  layout "window"

  authorize_actions_for Case, except: [:show, :edit, :update]

  # GET /readers
  # GET /readers.json
  def index
    @readers = Reader.all.order(:name).preload(:roles).includes(:cases, enrollments: [:case])

    render layout: 'admin'
  end

  # GET /readers/1
  # GET /readers/1.json
  def show
  end

  # GET /readers/new
  def new
    @reader = Reader.new
  end

  # GET /readers/1/edit
  def edit
    authorize_action_for @reader
  end

  # POST /readers
  # POST /readers.json
  def create
    @reader = Reader.new(reader_params)

    respond_to do |format|
      if @reader.save
        format.html { redirect_to @reader, notice: 'Reader was successfully created.' }
        format.json { render :show, status: :created, location: @reader }
      else
        format.html { render :new }
        format.json { render json: @reader.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /readers/1
  # PATCH/PUT /readers/1.json
  def update
    authorize_action_for @reader
    respond_to do |format|
      if @reader.update(reader_params)
        format.html { redirect_to edit_reader_path(@reader), notice: 'Reader was successfully updated.' }
        format.json { render :show, status: :ok, location: @reader }
      else
        format.html { render :edit }
        format.json { render json: @reader.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /readers/1
  # DELETE /readers/1.json
  def destroy
    @reader.destroy
    respond_to do |format|
      format.html { redirect_to readers_url, notice: 'Reader was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_reader
      @reader = Reader.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def reader_params
      params.require(:reader).permit(:name, :initials, :email, :locale)
    end
end
