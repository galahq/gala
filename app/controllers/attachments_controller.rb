# frozen_string_literal: true

# Base controller for handling the deletion of ActiveStorage attachments.
# This is temporary, because rails master already supports deleting attachments
# from the model by setting them equal to nil. That means we'll be able to
# handle it from ModelController#update with no additional controller logic.
#
# Subclass this model, implement at least set_model, and add a route for the
# subclass's delete method.
#
# @abstract
class AttachmentsController < ApplicationController
  before_action :set_model
  before_action :set_attribute
  before_action :set_attachment

  # Define how to find your model
  def self.model(code)
    define_method :set_model do
      @model = instance_exec(&code)
    end
  end

  def self.attachment_attributes
    @attachment_attributes ||= []
  end

  # Add permitted attributes to the allowlist
  def self.permit_attributes(*attributes)
    attachment_attributes.concat attributes.flat_map(&:to_s)
  end

  # Optionally, define how to authorize the action
  def self.authorize_action(code)
    before_action -> { instance_exec(@model, &code) }
  end

  # Add routes for each subclass that look like this
  # @param [DELETE] /model/:model_param/attachments/:attribute
  def destroy
    @attachment.detach
    head :no_content
  end

  private

  def set_model
    raise NotImplementedError
  end

  def set_attribute
    @attribute = params[:attribute]
    return if self.class.attachment_attributes.include? @attribute

    head :not_found
  end

  def set_attachment
    @attachment = @model.send @attribute
  end
end
