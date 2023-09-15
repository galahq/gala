# frozen_string_literal: true

# Attach a license to a model.
module Licensable
  extend ActiveSupport::Concern

  included do
    validates :license, inclusion: {
      in: -> (record) { record.available_licenses.map{|o| o['id'] } },
      message: "%{value} is not a valid license"
    }
  end

  def available_licenses
    LICENSES.select do |license|
      has_grandfathered_license? || license['active'] == true
    end
  end

  def has_grandfathered_license?
    !license_changed? && license == 'all_rights_reserved'
  end

  def license_config
    conf = LICENSES.find { |l| l['id'] == license }
    conf['icon_path'] = ActionController::Base.helpers.asset_path(
      "licenses/#{conf['icon']}"
    ) rescue nil
    conf
  end
end
