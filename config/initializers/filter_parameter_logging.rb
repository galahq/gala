# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Configure sensitive parameters which will be filtered from the log file.
#
# Rails matches these as substrings, so :passw covers password and
# password_confirmation, :email covers email and unconfirmed_email, and
# :token covers confirmation_token and authentication_token. This is Rails'
# own default list; the previous [:password] was a leftover from an older
# generator and let email addresses into the logs in plaintext, since lograge
# logs every other request parameter.
#
# 'comment.content' is a nested key: it filters the forum comment body
# (comment[content]) and nothing else, where a bare :content would also match
# content_type and similar. Nested keys don't apply to ActiveRecord#inspect.
Rails.application.config.filter_parameters += %i[
  passw email secret token _key crypt salt certificate otp ssn
] + ['comment.content']
