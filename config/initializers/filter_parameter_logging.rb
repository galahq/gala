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
# Beyond the default list:
# - :lis_person covers the LTI launch fields (lis_person_name_full,
#   lis_person_sourcedid, ...) that arrive as controller params.
# - The dotted keys match on the nested path: 'comment.content' filters the
#   forum comment body (comment[content]), 'answers.content' the quiz answer
#   text (submission[answers][][content]), and 'reader.name' / 'reader.initials'
#   the registration and profile forms, where a bare :content or :name would
#   hit content_type and the like everywhere. Dotted keys don't apply to
#   ActiveRecord#inspect.
# - /\Akey\z/ is the magic-link enrolment key (/magic_link?key=...), which
#   :_key does not cover.
Rails.application.config.filter_parameters += %i[
  passw email secret token _key crypt salt certificate otp ssn lis_person
] + ['comment.content', 'answers.content', 'reader.name', 'reader.initials',
     /\Akey\z/]
