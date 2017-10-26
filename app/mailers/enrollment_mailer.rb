# frozen_string_literal: true

class EnrollmentMailer < ApplicationMailer
  helper :cases

  def introduce_case(enrollment)
    @case = enrollment.case
    @reader = enrollment.reader

    @token = @reader.send(:set_reset_password_token) if @reader.sign_in_count
                                                               .zero?

    mail(to: enrollment.reader.name_and_email,
         subject: 'You’ve been enrolled in a new ' \
                  'teaching case on Gala') do |format|
      format.text
      format.html
    end
  end
end
