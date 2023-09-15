class AddLicenseToCase < ActiveRecord::Migration[6.0]
  def change
    # existing cases will default to the all_rights_reserved
    # and new cases will default to the cc_by_nc license

    add_column :cases, :license, :string,
                null: false, default: 'all_rights_reserved'

    change_column_default :cases, :license, 'cc_by_nc'
  end
end
