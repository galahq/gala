# frozen_string_literal: true

module Catalog
  module ContentItems
    # Enable cancelling the ContentItemSelection session
    class SessionsController < ApplicationController
      include SelectionParams

      def destroy
        clear_content_item_selection_params
        head :no_content
      end
    end
  end
end
