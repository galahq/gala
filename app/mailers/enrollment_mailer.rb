class EnrollmentMailer < ActionMailer::Base
  def introduce_case(enrollment)
    @case = enrollment.case
    @reader = enrollment.reader

    mail to: enrollment.reader.name_and_email,
      subject: "You’ve been enrolled in a new Michigan Sustainability Case"
  end
end
