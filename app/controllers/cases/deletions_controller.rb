# frozen_string_literal: true

module Cases
  # Confirm the user’s intent to delete a case by asking them to type its title
  class DeletionsController < ApplicationController
    before_action :authenticate_reader!
    before_action :set_case

    layout 'admin'

    # @route [GET] `/cases/slug/confirm_deletion`
    def new
      authorize @case, :destroy?
      @confirm_deletion_form = ConfirmDeletionForm.new case: @case
    end

    # @route [POST] `/cases/slug/confirm_deletion`
    def create
      authorize @case, :destroy?
      @confirm_deletion_form = ConfirmDeletionForm.new form_params

      if @confirm_deletion_form.save
        redirect_to my_cases_path, alert: successfully_destroyed(:case)
      else
        render :new
      end
    end

    private

    def set_case
      @case = Case.friendly.find params[:case_slug]
      head :not_found unless @case.present?
      @case = @case.decorate
    end

    def form_params
      params.require(:confirm_deletion_form).permit(:kicker_confirmation)
            .merge(case: @case)
    end
  end
end
