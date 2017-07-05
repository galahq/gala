# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  helper :application

  FROM_ADDRESS = 'hello@learnmsc.org'
  default from: "Michigan Sustainability Cases <#{FROM_ADDRESS}>"

  layout 'mailer'
end
