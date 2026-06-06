# frozen_string_literal: true

require 'digest'

module GalaTestData
  module_function

  def next_value(prefix)
    @counter ||= 0
    @counter += 1
    "#{prefix} #{@counter}"
  end

  def name
    next_value('Reader')
  end

  def email
    "reader-#{next_value('email').parameterize}@example.com"
  end

  def house
    next_value('House')
  end

  def sentence
    "#{next_value('Sentence')}."
  end

  def words(number:)
    number.times.map { next_value('word').parameterize }
  end

  def paragraphs(number:)
    number.times.map { sentence }
  end

  def question
    "#{next_value('Question')}?"
  end

  def sentences(number:)
    number.times.map { sentence }
  end

  def md5
    Digest::MD5.hexdigest(next_value('digest'))
  end

  def backward_time(days:)
    Time.current - ((days / 2).days)
  end

  def google_auth_hash
    OmniAuth::AuthHash.new(
      provider: 'google',
      uid: 'google-test-reader',
      info: {
        email: 'google-reader@example.com',
        name: 'Google Reader',
        first_name: 'Google',
        last_name: 'Reader',
        image: 'https://example.com/google-reader.png'
      },
      credentials: {
        token: 'google-token',
        secret: 'google-secret'
      },
      extra: {
        raw_info: {
          locale: 'en'
        }
      }
    )
  end
end
