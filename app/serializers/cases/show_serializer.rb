# frozen_string_literal: true

module Cases
  # All the necessary data for the show view
  class ShowSerializer < CaseSerializer
    attribute :sign_in_form, unless: :reader_signed_in?

    attribute :quiz, if: :reader_signed_in?
    attribute :reader, if: :reader_signed_in?
    attribute :statistics, if: :reader_signed_in?

    def quiz
      deployment = instance_options[:deployment]
      {
        needs_pretest: deployment.reader_needs_pretest?(current_user),
        needs_posttest: deployment.reader_needs_posttest?(current_user)
      }.merge(
        ActiveModel::Serializer.for(deployment.quiz).as_json || {}
      )
    end

    def reader
      ActiveModel::Serializer
        .for(current_user).as_json
        .merge can_update_case: Pundit.policy(current_user, object).update?,
               enrollment: instance_options[:enrollment]
    end

    def sign_in_form
      render partial: 'devise/sessions/sign_in',
             formats: [:html],
             locals: { resource: Reader.new }
    end

    def statistics
      if current_user.has_cached_role?(:editor)
        { keep: true }
      else
        false
      end
    end
  end
end
