# frozen_string_literal: true

json.form render(partial: 'devise/sessions/sign_in',
                 formats: [:html],
                 locals: { resource: Reader.new })
