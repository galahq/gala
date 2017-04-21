class ApplicationMailer < ActionMailer::Base
  helper :application
  default from: 'Michigan Sustainability Cases <msc-contact@umich.edu>'

  layout 'mailer'
end
