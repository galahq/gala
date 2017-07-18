# frozen_string_literal: true

module Readers
  # Handle email confirmation after new account creation.
  class ConfirmationsController < Devise::ConfirmationsController
    # @method new
    # @route [GET] `/resource/confirmation/new`
    # ```
    # def new
    #   super
    # end
    # ```

    # @method create
    # @route [POST] `/resource/confirmation`
    # ```
    # def create
    #   super
    # end
    # ```

    # @method show
    # @route [GET] `/resource/confirmation?confirmation_token=abcdef`
    # ```
    # def show
    #   super
    # end
    # ```

    protected

    # The path used after resending confirmation instructions.
    # def after_resending_confirmation_instructions_path_for(resource_name)
    #   super(resource_name)
    # end

    # The path used after confirmation.
    def after_confirmation_path_for(resource_name, resource)
      magic_linked_case = resource.try(:enrollments).try(:first).try(:case)
      if magic_linked_case
        return case_path magic_linked_case, trailing_slash: true
      end

      super(resource_name, resource)
    end
  end
end
