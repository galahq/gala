# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  helper :application

  FROM_ADDRESS = 'hello@learngala.com'
  default from: "Gala <#{FROM_ADDRESS}>"

  layout 'mailer'
end
