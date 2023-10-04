# frozen_string_literal: true

LICENSES = YAML.load_file(
  Rails.root.join('config', 'licenses.yml')
)['licenses'].freeze
