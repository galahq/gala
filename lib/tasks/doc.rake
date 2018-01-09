# frozen_string_literal: true

# Let's make sure this doesn't happen in production
if Rails.env.development?
  namespace :doc do
    desc 'Runs yard documentation generator.'
    task :yard do
      system(
        'yard', 'doc',
        '--embed-mixins',
        '--private', '--protected',
        '--markup', 'markdown',
        '--output-dir', 'doc/yard',
        '--type-tag', 'route:Route'
      )
    end
    desc 'Generates dash docset from yard output'
    task dash: :yard do
      system(
        'bundle', 'exec', 'doc_to_dash',
        'doc/yard',
        '--name', 'Gala',
        '--output', 'doc/dash',
        '--parser', 'YardParser'
      )
    end
  end
end
