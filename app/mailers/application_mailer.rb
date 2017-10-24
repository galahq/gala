# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  helper :application

  FROM_ADDRESS = 'hello@learnmsc.org'
  default from: "#{ENV['FLAG_OLD_LOGO'] ? 'Michigan Sustainability Cases' : 'Gala'}<#{FROM_ADDRESS}>"

  layout 'mailer'
end
