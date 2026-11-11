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
    # is not a guard: Administrate's `existing_action?` is a `helper_method` used
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

    # Tier 2 full erasure (erasure checklist, step 5), run by a site admin once
    # the person has confirmed the request. Only for closed accounts: Tier 2
    # always starts from one. The page says what will go, so it can be quoted
    # in the reply.
    def erasure
      return redirect_to([namespace, requested_resource], alert: t('admin.readers.erase.not_closed')) unless
        requested_resource.closed?

      @reader = requested_resource
      @summary = Readers::ErasureSummary.new(@reader)
    end

    # Erasing can't be undone, so the reader id has to be typed back, the same
    # safeguard as typing your email to close an account.
    def erase
      reader = requested_resource
      return redirect_to([:erasure, namespace, reader], alert: t('.mismatch')) unless erasure_confirmed?(reader)

      Readers::EraseAccount.call(reader, erased_by: current_reader)
      redirect_to [namespace, reader], notice: t('.erased')
    rescue Readers::EraseAccount::NotClosed
      redirect_to [namespace, reader], alert: t('.not_closed')
    end

    private

    def erasure_confirmed?(reader)
      params[:confirm_reader_id].to_s.strip == reader.id.to_s
    end

    def resource_params
      permitted = super
      return permitted unless action_name == 'update' && requested_resource.closed?

      permitted.except(*CLOSED_READ_ONLY)
    end
  end
end
