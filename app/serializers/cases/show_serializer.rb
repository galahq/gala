# frozen_string_literal: true

module Cases
  # All the necessary data for the show view
  class ShowSerializer < CaseSerializer
    attribute :sign_in_form, unless: :reader_signed_in?

    attribute :quiz, if: :reader_signed_in?
    attribute :reader, if: :reader_signed_in?
    attribute :statistics, if: :reader_signed_in?

    link(:archive) { case_archive_path object }
    link(:new_editorship) { new_case_editorship_path object }
    link(:new_translation) { new_case_translation_path object }
    link(:settings) { edit_case_settings_path object }
    link(:taggings) { case_taggings_path object }
    link(:teach) { new_deployment_path case_slug: object.slug }
    link(:teaching_guide) { case_attachment_path object, :teaching_guide }
    link(:new_copy) { copy_case_path object  }

    def kicker
      object.kicker
    end

    def quiz
      deployment = instance_options[:deployment]
      quiz_necessity = {
        needs_pretest: deployment.reader_needs_pretest?(current_user),
        needs_posttest: deployment.reader_needs_posttest?(current_user)
      }
      return quiz_necessity unless deployment.quiz.present?

      options = { serializer: Quizzes::UnsubmittedSerializer }
      quiz = ActiveModel::Serializer.for(deployment.quiz, **options).as_json
      quiz_necessity.merge(quiz)
    end

    def reader
      ActiveModel::Serializer
        .for(current_user, scope: view_context, scope_name: :view_context)
        .as_json
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
