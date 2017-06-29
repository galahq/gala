# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  helper :application
  default from: 'Michigan Sustainability Cases <hello@learnmsc.org>'

  layout 'mailer'
end
