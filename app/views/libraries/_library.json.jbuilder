# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! library, :slug, :name, :logo_url, :background_color,
              :foreground_color
