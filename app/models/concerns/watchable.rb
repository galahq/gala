# frozen_string_literal: true

# Models for which changes will be broadcast to the EditsChannel of the case
module Watchable
  extend ActiveSupport::Concern

  included do
    after_commit :broadcast_edit
  end

  def updated?
    created_at != updated_at
  end

  private

  def broadcast_edit
    EditBroadcastJob.perform_later self,
                                   case_slug: self.case.slug,
                                   cached_params: edit_broadcast_cached_params
  end

  def edit_broadcast_cached_params
    { type: model_name.name, table: model_name.plural, param: to_param }
  end
end
