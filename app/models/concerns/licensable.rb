# frozen_string_literal: true

# Attach a license to a model.
module Licensable
  extend ActiveSupport::Concern

  included do
    validates :license, inclusion: {
      in: ->(record) { record.available_licenses.map { |o| o['id'] } },
      message: '%<value>s is not a valid license'
    }
  end

  def licensor(reader)
    @reader = reader
  end

  def available_licenses(reader = nil)
    return LICENSES if grandfathered_license? || @reader&.has_role?(:editor)
    LICENSES.select do |o|
       o['active'] == true
    end
  end

  def grandfathered_license?
    !license_changed? && license == 'all_rights_reserved'
  end

  def license_config
    conf = LICENSES.find { |o| o['id'] == license }
    conf['icon_path'] = ActionController::Base.helpers.asset_path(
      "licenses/#{conf['icon']}"
    ) rescue nil
    conf
  end
end
