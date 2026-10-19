# frozen_string_literal: true

module Admin
  # Administrate dashboard for {Reader}. Deletion is closed here — see #destroy.
  class ReadersController < Admin::ApplicationController
    # Identity is read-only while an account is closed (grace-state rule W9).
    # The form's name field shows "Deleted user", so saving it would write
    # that over the stored name and make the account impossible to restore as
    # it was.
    CLOSED_READ_ONLY = %w[name email initials image_url].freeze

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

    # Grace-state rule W10: support can restore an account closed by mistake,
    # through the same {Readers::RestoreAccount} the reader uses. Admins cannot
    # close or anonymize from here.
    def restore
      Readers::RestoreAccount.call(requested_resource)
      redirect_to [namespace, requested_resource], notice: t('.restored')
    rescue Readers::RestoreAccount::NotRestorable
      redirect_to [namespace, requested_resource], alert: t('.not_restorable')
    end

    private

    def resource_params
      permitted = super
      return permitted unless action_name == 'update' && requested_resource.closed?

      permitted.except(*CLOSED_READ_ONLY)
    end
  end
end
