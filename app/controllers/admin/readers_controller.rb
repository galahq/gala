# frozen_string_literal: true

module Admin
  # Administrate dashboard for {Reader}. Deletion is closed here — see #destroy.
  class ReadersController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # you can overwrite any of the RESTful actions. For example:
    #
    # def index
    #   super
    #   @resources = Reader.
    #     page(params[:page]).
    #     per(10)
    # end

    # Define a custom finder by overriding the `find_resource` method:
    # def find_resource(param)
    #   Reader.find_by!(slug: param)
    # end

    # See https://administrate-prototype.herokuapp.com/customizing_controller_actions
    # for more information

    # `Admin::ApplicationController#disabled_actions` lists `destroy`, but that
    # is not a guard: Administrate's `valid_action?` is a `helper_method` used
    # only by views deciding whether to render a link. The action itself stays
    # routable, so any `:editor` can invoke it. `Reader#destroy` is unsafe —
    # see the analysis in PR #796 — so close it explicitly.
    def destroy
      head :not_found
    end
  end
end
