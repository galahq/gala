# frozen_string_literal: true

# @abstract
class ApplicationMailbox < ActionMailbox::Base
  routing /^reply/i => :replies
end
